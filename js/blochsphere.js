class BlochSphere extends BABYLON.Mesh {
    constructor(name, scene, inclinationRadians, azimuthRadians) {
        super(name, scene);
        this.inclinationRadians = inclinationRadians;
        this.azimuthRadians = azimuthRadians;
        this.scene = scene;
        this.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameterX: 2.0, diameterY: 2.0, diameterZ: 2.0}, scene);
        this.lineColor = new BABYLON.Color3(.3, .3, .3);
        this.quantumStateLine = null;
        this.quantumStateLineCap = null;
        this.quantumStateLineColor = new BABYLON.Color3(0, 0, 1);

        this.setupSphere();
    }

    setCartesianCoords(babylonAxesVector) {
        var babylonAxisX = babylonAxesVector.x;
        var babylonAxisY = babylonAxesVector.y;
        var babylonAxisZ = babylonAxesVector.z;

        this.inclinationRadians = Math.acos(babylonAxisY);
        this.azimuthRadians = (Math.atan(babylonAxisX / -babylonAxisZ) + Math.PI * 2) % (Math.PI * 2);
    }

    getCartesianCoords() {
        var babylonAxisX = Math.sin(this.inclinationRadians) *
            Math.sin(this.azimuthRadians);
        var babylonAxisY = Math.cos(this.inclinationRadians);
        var babylonAxisZ = -Math.sin(this.inclinationRadians) *
            Math.cos(this.azimuthRadians);

        return new BABYLON.Vector3(babylonAxisX, babylonAxisY, babylonAxisZ);
    }

    getProbAmplitude0() {
        var probAmpComplex = new ComplexNum(Math.cos(this.getInclinationRadians() / 2), 0);
        return probAmpComplex;
    }

    getProbAmplitude1() {
        var sinHalfIncl = Math.sin(this.getInclinationRadians() / 2);
        var probAmpComplex = new ComplexNum(Math.cos(this.getAzimuthRadians()) * sinHalfIncl,
            Math.sin(this.getAzimuthRadians()) * sinHalfIncl);
        return probAmpComplex;
    }

    getProbability0() {
        return Math.pow(this.getProbAmplitude0().absValue(), 2);
    }

    getProbability1() {
        return Math.pow(this.getProbAmplitude1().absValue(), 2);
    }

    setInclinationRadians(inclinationRadians) {
        this.inclinationRadians = inclinationRadians;
    }

    getInclinationRadians() {
        return this.inclinationRadians;
    }

    setAzimuthRadians(azimuthRadians) {
        this.azimuthRadians = (azimuthRadians + Math.PI * 2) % (Math.PI * 2);
    }

    getAzimuthRadians() {
        return this.azimuthRadians % (Math.PI * 2);
    }

    /// Methods to construct the 3D Bloch sphere
    setupSphere() {
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", this.scene);
        this.sphere.material = myMaterial;
        this.position.y = 0.0;
        this.sphere.scaling = new BABYLON.Vector3(1.0, 1.0, 1.0);

        var equator = this.createEquator();
        equator.parent = this.sphere;
        equator.color = this.lineColor;

        myMaterial.alpha = 0.4;

        //Array of points to construct Bloch X axis line
        var xAxisPoints = [
            new BABYLON.Vector3(0, 0, -1.0),
            new BABYLON.Vector3(0, 0, 1.0)
        ];

        //Array of points to construct Bloch Y axis line
        var yAxisPoints = [
            new BABYLON.Vector3(-1.0, 0, 0),
            new BABYLON.Vector3(1.0, 0, 0)
        ];

        //Array of points to construct Bloch Z axis line
        var zAxisPoints = [
            new BABYLON.Vector3(0, 1.0, 0),
            new BABYLON.Vector3(0, -1.0, 0)
        ];

        //Create lines
        var xAxisLine = BABYLON.MeshBuilder.CreateLines("xAxisLine", {points: xAxisPoints}, this.scene);
        var yAxisLine = BABYLON.MeshBuilder.CreateLines("yAxisLine", {points: yAxisPoints}, this.scene);
        var zAxisLine = BABYLON.MeshBuilder.CreateLines("zAxisLine", {points: zAxisPoints}, this.scene);

        xAxisLine.color = this.lineColor;
        yAxisLine.color = this.lineColor;
        zAxisLine.color = this.lineColor;

        xAxisLine.isPickable = false;
        yAxisLine.isPickable = false;
        zAxisLine.isPickable = false;

        xAxisLine.parent = this.sphere;
        yAxisLine.parent = this.sphere;
        zAxisLine.parent = this.sphere;

        // Axis labels
        var xChar = this.makeTextPlane("X", "black", 0.2);
        xChar.position = new BABYLON.Vector3(0, 0.1, -1.2);
        xChar.isPickable = false;

        var yChar = this.makeTextPlane("Y", "black", 0.2);
        yChar.position = new BABYLON.Vector3(1.2, 0, 0);
        yChar.isPickable = false;

        var zeroKet = this.makeTextPlane("|0>", "black", 0.2);
        zeroKet.position = new BABYLON.Vector3(0, 1.2, 0);
        zeroKet.isPickable = false;

        var oneKet = this.makeTextPlane("|1>", "black", 0.2);
        oneKet.position = new BABYLON.Vector3(0, -1.2, 0);
        oneKet.isPickable = false;

        var plusKet = this.makeTextPlane("|+>", "black", 0.2);
        plusKet.position = new BABYLON.Vector3(0, -0.1, -1.2);
        plusKet.isPickable = false;

        var minusKet = this.makeTextPlane("<-|", "black", 0.2);
        minusKet.position = new BABYLON.Vector3(0, 0, 1.2);
        minusKet.isPickable = false;
    }

    createEquator() {
        var myPoints = [];
        var radius = 1;
        var deltaTheta = Math.PI / 20;
        var theta = 0;
        var Y = 0;
        for (var i = 0; i<Math.PI * 20; i++) {
            myPoints.push(new BABYLON.Vector3(radius * Math.cos(theta), Y, radius * Math.sin(theta)));
            theta += deltaTheta;
        }

        //Create lines
        var lines = BABYLON.MeshBuilder.CreateDashedLines("lines", {points: myPoints, updatable: true}, this.scene);
        lines.isPickable = false;
        return lines;
    }

    makeTextPlane(text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, this.scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    }

    updateQuantumStateLine() {
        if (this.quantumStateLine) this.quantumStateLine.dispose();
        if (this.quantumStateLineCap) this.quantumStateLineCap.dispose();

        var qubitStateCartesianCoords = this.getCartesianCoords();

        var qStatePoints = [
            this.sphere.position,
            // new BABYLON.Vector3(0, 0, 0),
            qubitStateCartesianCoords
        ];
        this.quantumStateLine = BABYLON.MeshBuilder.CreateLines("qStatePoints", {points: qStatePoints}, this.scene);

        this.quantumStateLineCap = BABYLON.MeshBuilder.CreateCylinder("quantumStateLineCap", {height: 0.1, diameterTop: 0.0, diameterBottom: 0.1, tessellation: 6, subdivisions: 1 }, this.scene);

        this.quantumStateLine.color = this.quantumStateLineColor;
        this.quantumStateLineCap.color = this.quantumStateLineColor;
        this.quantumStateLineCap.position = this.getCartesianCoords();
        this.quantumStateLineCap.rotation = new BABYLON.Vector3(-this.getInclinationRadians(), -this.getAzimuthRadians(), 0);
    }

}
