// Warriors Time - Juego 3D con WebGL
// ====================================

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    alert('WebGL2 no es soportado en tu navegador');
    throw new Error('WebGL2 not supported');
}

// Redimensionar canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ====================================
// SHADERS
// ====================================

const vertexShaderSource = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec3 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

out vec3 vNormal;
out vec3 vPosition;
out vec3 vColor;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vPosition = vec3(uModelMatrix * vec4(aPosition, 1.0));
    vNormal = normalize(mat3(uModelMatrix) * aNormal);
    vColor = aColor;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;
in vec3 vColor;

uniform vec3 uLightPos;
uniform vec3 uCameraPos;

out vec4 FragColor;

void main() {
    // Iluminación
    vec3 lightDir = normalize(uLightPos - vPosition);
    vec3 viewDir = normalize(uCameraPos - vPosition);
    
    // Difusa
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Especular
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    
    // Combinar
    vec3 result = vColor * (0.3 + diff * 0.7) + vec3(1.0) * spec * 0.5;
    
    FragColor = vec4(result, 1.0);
}
`;

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const shaderProgram = createProgram(vertexShaderSource, fragmentShaderSource);

// ====================================
// MATRICES
// ====================================

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

const projectionMatrix = mat4.create();
const viewMatrix = mat4.create();
const modelMatrix = mat4.create();

mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 1000);

// ====================================
// GEOMETRÍA
// ====================================

function createCube(color = [1, 1, 1]) {
    const positions = [
        -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
        -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,
        -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,
        -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
         1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,
        -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1,
    ];

    const normals = [
        0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
        0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
        0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
        0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
        1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
        -1, 0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
    ];

    const colors = [];
    for (let i = 0; i < 24; i++) {
        colors.push(...color);
    }

    const indices = [
        0, 1, 2,   0, 2, 3,
        4, 5, 6,   4, 6, 7,
        8, 9, 10,  8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];

    return { positions, normals, colors, indices };
}

function createSphere(radius = 1, segments = 32, rings = 16) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];

    for (let ring = 0; ring <= rings; ring++) {
        const theta = (ring / rings) * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let seg = 0; seg <= segments; seg++) {
            const phi = (seg / segments) * 2 * Math.PI;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            positions.push(x * radius, y * radius, z * radius);
            normals.push(x, y, z);
            colors.push(0.8, 0.2, 0.2); // Rojo
        }
    }

    for (let ring = 0; ring < rings; ring++) {
        for (let seg = 0; seg < segments; seg++) {
            const a = ring * (segments + 1) + seg;
            const b = a + segments + 1;

            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    return { positions, normals, colors, indices };
}

function createBuffers(geometry) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

    return { positionBuffer, normalBuffer, colorBuffer, indexBuffer, indices: geometry.indices };
}

// ====================================
// OBJETOS DEL JUEGO
// ====================================

class Player {
    constructor() {
        this.position = vec3.fromValues(0, 0, 5);
        this.velocity = vec3.create();
        this.rotation = vec3.create();
        this.health = 100;
        this.maxHealth = 100;
        this.score = 0;
        this.level = 1;
        this.speed = 0.2;
        this.jumpForce = 0.3;
        this.isJumping = false;
        this.geometry = createCube([0.2, 0.8, 0.2]);
        this.buffers = createBuffers(this.geometry);
    }

    update(input) {
        // Movimiento
        if (input.forward) this.position[2] -= this.speed;
        if (input.backward) this.position[2] += this.speed;
        if (input.left) this.position[0] -= this.speed;
        if (input.right) this.position[0] += this.speed;

        // Gravedad
        this.velocity[1] -= 0.01;
        this.position[1] += this.velocity[1];

        // Colisión con suelo
        if (this.position[1] < 0) {
            this.position[1] = 0;
            this.velocity[1] = 0;
            this.isJumping = false;
        }

        // Saltar
        if (input.jump && !this.isJumping) {
            this.velocity[1] = this.jumpForce;
            this.isJumping = true;
        }

        // Rotación con mouse
        this.rotation[1] += input.mouseX * 0.001;
        this.rotation[0] += input.mouseY * 0.001;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    addScore(points) {
        this.score += points;
        if (this.score % 500 === 0) this.level++;
    }

    draw() {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, this.position);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.scale(modelMatrix, modelMatrix, [0.5, 1, 0.5]);

        drawGeometry(this.buffers);
    }
}

class Enemy {
    constructor(x, z) {
        this.position = vec3.fromValues(x, 0, z);
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 0.05;
        this.attackCooldown = 0;
        this.geometry = createSphere(0.5);
        this.buffers = createBuffers(this.geometry);
    }

    update(playerPos) {
        const direction = vec3.create();
        vec3.subtract(direction, playerPos, this.position);
        vec3.normalize(direction, direction);
        vec3.scaleAndAdd(this.position, this.position, direction, this.speed);

        this.attackCooldown--;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    draw() {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, this.position);

        drawGeometry(this.buffers);
    }

    getDistance(playerPos) {
        return vec3.distance(this.position, playerPos);
    }
}

class Projectile {
    constructor(position, direction) {
        this.position = vec3.clone(position);
        this.direction = vec3.normalize(vec3.create(), direction);
        this.speed = 0.3;
        this.life = 200;
        this.geometry = createSphere(0.2, 16, 8);
        this.buffers = createBuffers(this.geometry);
    }

    update() {
        vec3.scaleAndAdd(this.position, this.position, this.direction, this.speed);
        this.life--;
    }

    draw() {
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, this.position);

        drawGeometry(this.buffers);
    }

    isAlive() {
        return this.life > 0 && this.position[0] ** 2 + this.position[2] ** 2 < 2000;
    }
}

// ====================================
// ENTRADA DE USUARIO
// ====================================

const input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    attack: false,
    mouseX: 0,
    mouseY: 0,
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'w') input.forward = true;
    if (e.key === 's') input.backward = true;
    if (e.key === 'a') input.left = true;
    if (e.key === 'd') input.right = true;
    if (e.key === ' ') input.jump = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') input.forward = false;
    if (e.key === 's') input.backward = false;
    if (e.key === 'a') input.left = false;
    if (e.key === 'd') input.right = false;
    if (e.key === ' ') input.jump = false;
});

document.addEventListener('mousemove', (e) => {
    input.mouseX = e.movementX;
    input.mouseY = e.movementY;
});

document.addEventListener('click', () => {
    input.attack = true;
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
});

// ====================================
// RENDERIZADO
// ====================================

function drawGeometry(buffers) {
    gl.useProgram(shaderProgram);

    const posAttrib = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    const normAttrib = gl.getAttribLocation(shaderProgram, 'aNormal');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
    gl.vertexAttribPointer(normAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normAttrib);

    const colorAttrib = gl.getAttribLocation(shaderProgram, 'aColor');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
    gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttrib);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);

    const projLoc = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    gl.uniformMatrix4fv(projLoc, false, projectionMatrix);

    const viewLoc = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);

    const modelLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    const lightPosLoc = gl.getUniformLocation(shaderProgram, 'uLightPos');
    gl.uniform3f(lightPosLoc, 10, 10, 10);

    const cameraPosLoc = gl.getUniformLocation(shaderProgram, 'uCameraPos');
    gl.uniform3f(cameraPosLoc, player.position[0], player.position[1] + 1, player.position[2]);

    gl.drawElements(gl.TRIANGLES, buffers.indices.length, gl.UNSIGNED_SHORT, 0);
}

// ====================================
// LÓGICA DEL JUEGO
// ====================================

const player = new Player();
let enemies = [];
let projectiles = [];
let gameRunning = true;
let enemySpawnTimer = 0;

function updateCamera() {
    const cameraDistance = 3;
    const cameraHeight = 1;

    const cameraPos = vec3.create();
    cameraPos[0] = player.position[0] - Math.sin(player.rotation[1]) * cameraDistance;
    cameraPos[1] = player.position[1] + cameraHeight;
    cameraPos[2] = player.position[2] - Math.cos(player.rotation[1]) * cameraDistance;

    mat4.lookAt(viewMatrix, cameraPos, player.position, [0, 1, 0]);
}

function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 15;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    enemies.push(new Enemy(x, z));
}

function update() {
    if (!gameRunning) return;

    // Actualizar jugador
    player.update(input);

    // Spawnear enemigos
    enemySpawnTimer++;
    if (enemySpawnTimer > 100 - player.level * 5) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    // Actualizar enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(player.position);

        // Comprobar colisión con jugador
        if (enemies[i].getDistance(player.position) < 1.5) {
            if (enemies[i].attackCooldown <= 0) {
                player.takeDamage(5);
                enemies[i].attackCooldown = 60;
            }
        }

        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
            player.addScore(100);
        }
    }

    // Atacar
    if (input.attack) {
        const direction = vec3.fromValues(
            -Math.sin(player.rotation[1]),
            Math.sin(player.rotation[0]),
            -Math.cos(player.rotation[1])
        );
        projectiles.push(new Projectile(player.position, direction));
        input.attack = false;
    }

    // Actualizar proyectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update();

        if (!projectiles[i].isAlive()) {
            projectiles.splice(i, 1);
            continue;
        }

        // Colisión con enemigos
        for (let j = enemies.length - 1; j >= 0; j--) {
            const dist = vec3.distance(projectiles[i].position, enemies[j].position);
            if (dist < 1) {
                if (enemies[j].takeDamage(25)) {
                    enemies.splice(j, 1);
                    player.addScore(50);
                }
                projectiles.splice(i, 1);
                break;
            }
        }
    }

    // Game Over
    if (player.health <= 0) {
        gameRunning = false;
        showGameOver();
    }

    updateCamera();
}

function render() {
    gl.clearColor(0.1, 0.1, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Dibujar suelo
    mat4.identity(modelMatrix);
    mat4.scale(modelMatrix, modelMatrix, [50, 0.1, 50]);
    const groundGeometry = createCube([0.3, 0.3, 0.3]);
    const groundBuffers = createBuffers(groundGeometry);
    drawGeometry(groundBuffers);

    // Dibujar jugador
    player.draw();

    // Dibujar enemigos
    for (let enemy of enemies) {
        enemy.draw();
    }

    // Dibujar proyectiles
    for (let projectile of projectiles) {
        projectile.draw();
    }
}

function updateUI() {
    document.getElementById('healthValue').textContent = Math.max(0, player.health);
    document.getElementById('health').style.width = (player.health / player.maxHealth) * 100 + '%';
    document.getElementById('scoreValue').textContent = player.score;
    document.getElementById('levelValue').textContent = player.level;
}

function showGameOver() {
    document.getElementById('endScreen').style.display = 'block';
    document.getElementById('endScore').textContent = `Puntuación Final: ${player.score}`;
    document.getElementById('endLevel').textContent = `Nivel Alcanzado: ${player.level}`;
}

document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload();
});

// ====================================
// LOOP PRINCIPAL
// ====================================

function gameLoop() {
    update();
    render();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Iniciar
console.log('Warriors Time - Iniciando...');
gameLoop();
