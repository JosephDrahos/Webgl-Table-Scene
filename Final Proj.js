// Name:

var gl;
var numVertices;
var numTriangles;
var lightFlag1;
var lightFlag2;
var shaderFlag;
var topChair;
var bottomChair;
var topTable;
var bottomTable;
var program;
var xFlag;
var yFlag;
var zFlag;
var alphaUniform;
var alphaValue;
var betaUniform;
var betaValue;
var chiUniform;
var chiValue;
var txValue;
var tyValue;
var txUniform
var tyUniform;
var sxValue;
var syValue;
var sxUniform
var syUniform;
var teapotIBuffer;
var teapotNormalsBuffer;
var teapotVertexBuffer;
var teapotNumTriangles;


function initGL(){
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.enable(gl.DEPTH_TEST);
    gl.viewport( 0, 0, 512, 512 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    initTopChair();
    initBottomChair();
    

    initTopTable();
    initBottomTable();

    initTeapot();
    
    // render the object
    drawObject();

};

function initTeapot(){
    program = initShaders( gl, "vertex-shader-no-texture", "fragment-shader-no-texture" );
    gl.useProgram( program );

    
    //Enter Code Here
    alphaValue = .0;
    betaValue = .0;
    chiValue = .0;

    alphaUniform = gl.getUniformLocation(program, "alpha");
    betaUniform = gl.getUniformLocation(program, "beta");
    chiUniform = gl.getUniformLocation(program, "chi");

    gl.uniform1f(alphaUniform, alphaValue);
    gl.uniform1f(betaUniform, betaValue);
    gl.uniform1f(chiUniform, chiValue);

    xFlag = 0.0;
    yFlag = 0.0;
    zFlag = 0.0;

    sxValue = 0.0;
    syValue = 0.0;
    txValue = 20.0;
    tyValue = 60.0;

    sxUniform = gl.getUniformLocation(program, "sx");
    syUniform = gl.getUniformLocation(program, "sy");
    txUniform = gl.getUniformLocation(program, "tx");
    tyUniform = gl.getUniformLocation(program, "ty");

    gl.uniform1f(txUniform, txValue);
    gl.uniform1f(tyUniform, tyValue);


    gl.enable(gl.DEPTH_TEST);

    numVertices = 531;
    numTriangles = 1062;
    teapotNumTriangles = numTriangles;
    var vertices = getVertices();
    var indexList = getFaces();

    

     // will populate to create buffer for indices
     teapotIBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);

    // Code here to handle putting above lists into buffers
    teapotVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var myPosition = gl.getAttribLocation(program, "vertexPosition");
    gl.vertexAttribPointer(myPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(myPosition);

    // Step 1: Position the camera using the look at method
    
    // Define eye (use vec3 in MV.js)
    var e = vec3(100.0, 40.0, 80.0);
    
    // Define at point (use vec3 in MV.js)
    var a = vec3(0.0, 0.0, 0.0);

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0);
    // Obtain n (use subtract and normalize in MV.js)
    var n  = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));
    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                            u[1], v[1], n[1], 0.0,
                            u[2], v[2], n[2], 0.0,
                        -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                        -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                        -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
     
    // Step 2: Set up orthographic and perspective projections
    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                            u[1], v[1], n[1], e[1],
                                            u[2], v[2], n[2], e[2],
                                            0.0, 0.0, 0.0, 1.0];

    var modelviewMatrixLocation = gl.getUniformLocation(program, "modelview");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(program,"modelviewInverseTranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
    
    // Define left plane
    //30
    var left = -40.0;
    // Define right plane
    var right = 40.0;
    // Define top plane
    var top = 40.0;
    // Define bottom plane
    var bottom = -40.0;
    // Define near plane
    //30
    var near = 50.0;
    // Define far plane
    //105
    var far = 130.0;
    // Set up orthographic projection matrix P_orth using above planes
    var P_orth = [2.0/(right-left), .0, .0, .0,
                    .0, 2.0/(top-bottom), .0, .0,
                .0, .0, -2.0/(far-near) , .0,
                -(left+right)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1.0]

    var orthographicProjectionMatrixLocation = gl.getUniformLocation(program, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, P_orth);
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [2.0*near/(right-left), .0, .0, .0,
                    .0, 2.0*near/(top-bottom), .0, .0,
                    (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1.0,
                    .0, .0, -2.0*far*near/ (far-near), .0];

    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(program, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, P_persp);
    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections

    shaderFlag = 1.0;

    
    // Step 3.1: Normals for lighting calculations
    
    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    teapotNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(program,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    // Set up coefficients for the object
    // (ambient coefficients, diffuse coefficients,
    // specular coefficients, shininess)
    // and send them as uniform variables to the shader program (NEEDS CODE)
    var kaloc = gl.getUniformLocation( program, "ka");
    var kdloc = gl.getUniformLocation( program, "kd");
    var ksloc = gl.getUniformLocation( program, "ks");
    gl.uniform3f( kaloc, 0.5, 0.5, 0.5);
    gl.uniform3f( kdloc, 0.5, 0.5, 0.5);
    gl.uniform3f( ksloc, 1.0, 1.0, 1.0);
    var alphaloc = gl.getUniformLocation( program, "alphaLight");
    gl.uniform1f(alphaloc, 4.0);
    
    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    
    var p0loc = gl.getUniformLocation(program, "p0");
    gl.uniform3f( p0loc, 0.0, 140.0, 0.0);

    var Ialoc = gl.getUniformLocation( program, "Ia1");
    var Idloc = gl.getUniformLocation( program, "Id1");
    var Isloc = gl.getUniformLocation( program, "Is1");
    gl.uniform3f( Ialoc, 0.1, 0.1, 0.1);
    gl.uniform3f( Idloc, 0.8, 0.8, 0.5);
    gl.uniform3f( Isloc, 0.8, 0.8, 0.8);
    // Set up the second light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    var p1loc = gl.getUniformLocation(program, "p1");
    gl.uniform3f( p1loc, 0.0, -150.0, 0.0);

    var Ia2loc = gl.getUniformLocation( program, "Ia2");
    var Id2loc = gl.getUniformLocation( program, "Id2");
    var Is2loc = gl.getUniformLocation( program, "Is2");
    gl.uniform3f( Ia2loc, 0.1, 0.1, 0.1);
    gl.uniform3f( Id2loc, 0.8, 0.8, 0.5);
    gl.uniform3f( Is2loc, 0.8, 0.8, 0.8);
    // Initialize up on/off flags for the both light sources. These
    // flags should be controlled using buttons
    lightFlag1 = 1.0;
    lightFlag2 = 1.0;
    specFlag = 0.0;

    lightFlag1Location = gl.getUniformLocation(program,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    lightFlag2Location = gl.getUniformLocation(program,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);
}

function initTopChair(){
    myShaderProgramTopChair = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgramTopChair );

    
    var textureImage = gl.createTexture(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = "https://live.staticflickr.com/4512/26182715569_e5c652be77_b.jpg";
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    var textureCoordinates = getTopChairTextureCoords();

    myImage.src = url;

    numVertices = 24;
    numTriangles = 12;
    var vertices = getTopChairVertices(); // vertices and faces are defined in object.js
    var indexList = getTopChairFaces();
    
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(myShaderProgramTopChair,"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(myShaderProgramTopChair,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(myShaderProgramTopChair,"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    
    // WORK ON THIS LAB IN TWO ITERATIONS
    // In the first iteration, do Steps 1 and 2 (i.e., do the Viewing portion)
    // and try to determine if you can see a silhouette (i.e., a filled outline)
    // of the chair. You will not see any inner detail, but you will at least know
    // that the chair is within the viewport. Make sure while doing this step
    // to apply the modelview and projection matrices in the vertex shader
    
    // In the second iteration, do Steps 3.1 (normal calculation and light setup), 3.2 (vertex
    // shader calculations for lighting, and steps 3.3 (fragment shader calculations
    // for lighting) so you can see the inner detail of the chair
    
    // FOLLOWING LINES IN STEPS 1 AND 2 NEED CODE FOR EACH COMMENT
    
    
    // Step 1: Position the camera using the look at method
    
    // Define eye (use vec3 in MV.js)
    var e = vec3(100.0, 40.0, 80.0);
    
    // Define at point (use vec3 in MV.js)
    var a = vec3(0.0, 0.0, 0.0);

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0);
    // Obtain n (use subtract and normalize in MV.js)
    var n  = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));
    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                            u[1], v[1], n[1], 0.0,
                            u[2], v[2], n[2], 0.0,
                        -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                        -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                        -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
     
    // Step 2: Set up orthographic and perspective projections
    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                            u[1], v[1], n[1], e[1],
                                            u[2], v[2], n[2], e[2],
                                            0.0, 0.0, 0.0, 1.0];

    var modelviewMatrixLocation = gl.getUniformLocation(myShaderProgramTopChair, "modelview");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(myShaderProgramTopChair,"modelviewInverseTranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
    
    // Define left plane
    //30
    var left = -40.0;
    // Define right plane
    var right = 40.0;
    // Define top plane
    var top = 40.0;
    // Define bottom plane
    var bottom = -40.0;
    // Define near plane
    //30
    var near = 50.0;
    // Define far plane
    //105
    var far = 130.0;
    // Set up orthographic projection matrix P_orth using above planes
    var P_orth = [2.0/(right-left), .0, .0, .0,
                    .0, 2.0/(top-bottom), .0, .0,
                .0, .0, -2.0/(far-near) , .0,
                -(left+right)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1.0]

    var orthographicProjectionMatrixLocation = gl.getUniformLocation(myShaderProgramTopChair, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, P_orth);
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [2.0*near/(right-left), .0, .0, .0,
                    .0, 2.0*near/(top-bottom), .0, .0,
                    (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1.0,
                    .0, .0, -2.0*far*near/ (far-near), .0];

    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(myShaderProgramTopChair, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, P_persp);
    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections

    shaderFlag = 1.0;
    

    
    
    
    // Step 3.1: Normals for lighting calculations
    
    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(myShaderProgramTopChair,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    // Set up coefficients for the object
    // (ambient coefficients, diffuse coefficients,
    // specular coefficients, shininess)
    // and send them as uniform variables to the shader program (NEEDS CODE)
    var kaloc = gl.getUniformLocation( myShaderProgramTopChair, "ka");
    var kdloc = gl.getUniformLocation( myShaderProgramTopChair, "kd");
    var ksloc = gl.getUniformLocation( myShaderProgramTopChair, "ks");
    gl.uniform3f( kaloc, 0.5, 0.5, 0.5);
    gl.uniform3f( kdloc, 0.5, 0.5, 0.5);
    gl.uniform3f( ksloc, 1.0, 1.0, 1.0);
    var alphaloc = gl.getUniformLocation( myShaderProgramTopChair, "alpha");
    gl.uniform1f(alphaloc, 4.0);
    
    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    
    var p0loc = gl.getUniformLocation(myShaderProgramTopChair, "p0");
    gl.uniform3f( p0loc, 0.0, 140.0, 0.0);

    var Ialoc = gl.getUniformLocation( myShaderProgramTopChair, "Ia1");
    var Idloc = gl.getUniformLocation( myShaderProgramTopChair, "Id1");
    var Isloc = gl.getUniformLocation( myShaderProgramTopChair, "Is1");
    gl.uniform3f( Ialoc, 0.1, 0.1, 0.1);
    gl.uniform3f( Idloc, 0.8, 0.8, 0.5);
    gl.uniform3f( Isloc, 0.8, 0.8, 0.8);
    // Set up the second light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    var p1loc = gl.getUniformLocation(myShaderProgramTopChair, "p1");
    gl.uniform3f( p1loc, 0.0, -150.0, 0.0);

    var Ia2loc = gl.getUniformLocation( myShaderProgramTopChair, "Ia2");
    var Id2loc = gl.getUniformLocation( myShaderProgramTopChair, "Id2");
    var Is2loc = gl.getUniformLocation( myShaderProgramTopChair, "Is2");
    gl.uniform3f( Ia2loc, 0.1, 0.1, 0.1);
    gl.uniform3f( Id2loc, 0.8, 0.8, 0.5);
    gl.uniform3f( Is2loc, 0.8, 0.8, 0.8);
    // Initialize up on/off flags for the both light sources. These
    // flags should be controlled using buttons
    lightFlag1 = 1.0;
    lightFlag2 = 1.0;
    specFlag = 0.0;

    lightFlag1Location = gl.getUniformLocation(myShaderProgramTopChair,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    lightFlag2Location = gl.getUniformLocation(myShaderProgramTopChair,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    topChair = new objectClass(textureImage, url, numVertices, numTriangles, textureCoordinates ,myShaderProgramTopChair, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals);
}

function initBottomChair(){
    var shaderProgramBottomChair = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaderProgramBottomChair );

    textureImage = gl.createTexture(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = "https://static.vecteezy.com/system/resources/thumbnails/002/117/641/small/metal-texture-background-with-copy-space-illustration-vector.jpg";
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    var textureCoordinates = getBottomChairTextureCoords();
    
    myImage.src = url;
    numVertices = 24;
    numTriangles = 12;
    var vertices = getBottomChairVertices(); // vertices and faces are defined in object.js
    var indexList = getBottomChairFaces();
    
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(shaderProgramBottomChair,"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(shaderProgramBottomChair,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(shaderProgramBottomChair,"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    
    // WORK ON THIS LAB IN TWO ITERATIONS
    // In the first iteration, do Steps 1 and 2 (i.e., do the Viewing portion)
    // and try to determine if you can see a silhouette (i.e., a filled outline)
    // of the chair. You will not see any inner detail, but you will at least know
    // that the chair is within the viewport. Make sure while doing this step
    // to apply the modelview and projection matrices in the vertex shader
    
    // In the second iteration, do Steps 3.1 (normal calculation and light setup), 3.2 (vertex
    // shader calculations for lighting, and steps 3.3 (fragment shader calculations
    // for lighting) so you can see the inner detail of the chair
    
    // FOLLOWING LINES IN STEPS 1 AND 2 NEED CODE FOR EACH COMMENT
    
    
    // Step 1: Position the camera using the look at method
    
    // Define eye (use vec3 in MV.js)
    var e = vec3(100.0, 40.0, 80.0);
    
    // Define at point (use vec3 in MV.js)
    var a = vec3(0.0, 0.0, 0.0);

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0);
    // Obtain n (use subtract and normalize in MV.js)
    var n  = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));
    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                            u[1], v[1], n[1], 0.0,
                            u[2], v[2], n[2], 0.0,
                        -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                        -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                        -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
     
    // Step 2: Set up orthographic and perspective projections
    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                            u[1], v[1], n[1], e[1],
                                            u[2], v[2], n[2], e[2],
                                            0.0, 0.0, 0.0, 1.0];

    var modelviewMatrixLocation = gl.getUniformLocation(shaderProgramBottomChair, "modelview");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(shaderProgramBottomChair,"modelviewInverseTranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
    
    // Define left plane
    //30
    var left = -40.0;
    // Define right plane
    var right = 40.0;
    // Define top plane
    var top = 40.0;
    // Define bottom plane
    var bottom = -40.0;
    // Define near plane
    //30
    var near = 50.0;
    // Define far plane
    //105
    var far = 130.0;
    // Set up orthographic projection matrix P_orth using above planes
    var P_orth = [2.0/(right-left), .0, .0, .0,
                    .0, 2.0/(top-bottom), .0, .0,
                .0, .0, -2.0/(far-near) , .0,
                -(left+right)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1.0]

    var orthographicProjectionMatrixLocation = gl.getUniformLocation(shaderProgramBottomChair, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, P_orth);
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [2.0*near/(right-left), .0, .0, .0,
                    .0, 2.0*near/(top-bottom), .0, .0,
                    (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1.0,
                    .0, .0, -2.0*far*near/ (far-near), .0];

    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(shaderProgramBottomChair, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, P_persp);
    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections

    shaderFlag = 1.0;
    

    
    
    
    // Step 3.1: Normals for lighting calculations
    
    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(shaderProgramBottomChair,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    // Set up coefficients for the object
    // (ambient coefficients, diffuse coefficients,
    // specular coefficients, shininess)
    // and send them as uniform variables to the shader program (NEEDS CODE)
    var kaloc = gl.getUniformLocation( shaderProgramBottomChair, "ka");
    var kdloc = gl.getUniformLocation( shaderProgramBottomChair, "kd");
    var ksloc = gl.getUniformLocation( shaderProgramBottomChair, "ks");
    gl.uniform3f( kaloc, 0.5, 0.5, 0.5);
    gl.uniform3f( kdloc, 0.5, 0.5, 0.5);
    gl.uniform3f( ksloc, 1.0, 1.0, 1.0);
    var alphaloc = gl.getUniformLocation( shaderProgramBottomChair, "alpha");
    gl.uniform1f(alphaloc, 4.0);
    
    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    
    var p0loc = gl.getUniformLocation(shaderProgramBottomChair, "p0");
    gl.uniform3f( p0loc, 0.0, 140.0, 0.0);

    var Ialoc = gl.getUniformLocation( shaderProgramBottomChair, "Ia1");
    var Idloc = gl.getUniformLocation( shaderProgramBottomChair, "Id1");
    var Isloc = gl.getUniformLocation( shaderProgramBottomChair, "Is1");
    gl.uniform3f( Ialoc, 0.1, 0.1, 0.1);
    gl.uniform3f( Idloc, 0.8, 0.8, 0.5);
    gl.uniform3f( Isloc, 0.8, 0.8, 0.8);
    // Set up the second light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    var p1loc = gl.getUniformLocation(shaderProgramBottomChair, "p1");
    gl.uniform3f( p1loc, 0.0, -150.0, 0.0);

    var Ia2loc = gl.getUniformLocation( shaderProgramBottomChair, "Ia2");
    var Id2loc = gl.getUniformLocation( shaderProgramBottomChair, "Id2");
    var Is2loc = gl.getUniformLocation( shaderProgramBottomChair, "Is2");
    gl.uniform3f( Ia2loc, 0.1, 0.1, 0.1);
    gl.uniform3f( Id2loc, 0.8, 0.8, 0.5);
    gl.uniform3f( Is2loc, 0.8, 0.8, 0.8);
    // Initialize up on/off flags for the both light sources. These
    // flags should be controlled using buttons
    lightFlag1 = 1.0;
    lightFlag2 = 1.0;
    specFlag = 0.0;

    lightFlag1Location = gl.getUniformLocation(shaderProgramBottomChair,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    lightFlag2Location = gl.getUniformLocation(shaderProgramBottomChair,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    bottomChair = new objectClass(textureImage, url, numVertices, numTriangles, textureCoordinates, shaderProgramBottomChair, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals);
}

function initTopTable(){
    myShaderProgramTopTable = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgramTopTable );

    
    var textureImage = gl.createTexture(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = "https://cdn.shopify.com/s/files/1/0261/1567/0094/files/calacatta-marble.jpg?v=1566307871";
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    var textureCoordinates = getTopTableTextureCoords();

    myImage.src = url;

    numVertices = 24;
    numTriangles = 12;
    var vertices = getTopTableVertices(); // vertices and faces are defined in object.js
    var indexList = getTopTableFaces();
    
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(myShaderProgramTopTable,"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(myShaderProgramTopTable,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    

    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(myShaderProgramTopTable,"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    
    
    // WORK ON THIS LAB IN TWO ITERATIONS
    // In the first iteration, do Steps 1 and 2 (i.e., do the Viewing portion)
    // and try to determine if you can see a silhouette (i.e., a filled outline)
    // of the chair. You will not see any inner detail, but you will at least know
    // that the chair is within the viewport. Make sure while doing this step
    // to apply the modelview and projection matrices in the vertex shader
    
    // In the second iteration, do Steps 3.1 (normal calculation and light setup), 3.2 (vertex
    // shader calculations for lighting, and steps 3.3 (fragment shader calculations
    // for lighting) so you can see the inner detail of the chair
    
    // FOLLOWING LINES IN STEPS 1 AND 2 NEED CODE FOR EACH COMMENT
    
    
    // Step 1: Position the camera using the look at method
    
    // Define eye (use vec3 in MV.js)
    var e = vec3(100.0, 40.0, 80.0);
    
    // Define at point (use vec3 in MV.js)
    var a = vec3(0.0, 0.0, 0.0);

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0);
    // Obtain n (use subtract and normalize in MV.js)
    var n  = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));
    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                            u[1], v[1], n[1], 0.0,
                            u[2], v[2], n[2], 0.0,
                        -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                        -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                        -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
     
    // Step 2: Set up orthographic and perspective projections
    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                            u[1], v[1], n[1], e[1],
                                            u[2], v[2], n[2], e[2],
                                            0.0, 0.0, 0.0, 1.0];

    var modelviewMatrixLocation = gl.getUniformLocation(myShaderProgramTopTable, "modelview");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(myShaderProgramTopTable,"modelviewInverseTranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
    
    // Define left plane
    //30
    var left = -40.0;
    // Define right plane
    var right = 40.0;
    // Define top plane
    var top = 40.0;
    // Define bottom plane
    var bottom = -40.0;
    // Define near plane
    //30
    var near = 50.0;
    // Define far plane
    //105
    var far = 130.0;
    // Set up orthographic projection matrix P_orth using above planes
    var P_orth = [2.0/(right-left), .0, .0, .0,
                    .0, 2.0/(top-bottom), .0, .0,
                .0, .0, -2.0/(far-near) , .0,
                -(left+right)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1.0]

    var orthographicProjectionMatrixLocation = gl.getUniformLocation(myShaderProgramTopTable, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, P_orth);
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [2.0*near/(right-left), .0, .0, .0,
                    .0, 2.0*near/(top-bottom), .0, .0,
                    (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1.0,
                    .0, .0, -2.0*far*near/ (far-near), .0];

    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(myShaderProgramTopTable, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, P_persp);
    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections

    shaderFlag = 1.0;
    

    
    
    
    // Step 3.1: Normals for lighting calculations
    
    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(myShaderProgramTopTable,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    // Set up coefficients for the object
    // (ambient coefficients, diffuse coefficients,
    // specular coefficients, shininess)
    // and send them as uniform variables to the shader program (NEEDS CODE)
    var kaloc = gl.getUniformLocation( myShaderProgramTopTable, "ka");
    var kdloc = gl.getUniformLocation( myShaderProgramTopTable, "kd");
    var ksloc = gl.getUniformLocation( myShaderProgramTopTable, "ks");
    gl.uniform3f( kaloc, 0.5, 0.5, 0.5);
    gl.uniform3f( kdloc, 0.5, 0.5, 0.5);
    gl.uniform3f( ksloc, 1.0, 1.0, 1.0);
    var alphaloc = gl.getUniformLocation( myShaderProgramTopTable, "alpha");
    gl.uniform1f(alphaloc, 4.0);
    
    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    
    var p0loc = gl.getUniformLocation(myShaderProgramTopTable, "p0");
    gl.uniform3f( p0loc, 0.0, 140.0, 0.0);

    var Ialoc = gl.getUniformLocation( myShaderProgramTopTable, "Ia1");
    var Idloc = gl.getUniformLocation( myShaderProgramTopTable, "Id1");
    var Isloc = gl.getUniformLocation( myShaderProgramTopTable, "Is1");
    gl.uniform3f( Ialoc, 0.1, 0.1, 0.1);
    gl.uniform3f( Idloc, 0.8, 0.8, 0.5);
    gl.uniform3f( Isloc, 0.8, 0.8, 0.8);
    // Set up the second light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    var p1loc = gl.getUniformLocation(myShaderProgramTopTable, "p1");
    gl.uniform3f( p1loc, 0.0, -150.0, 0.0);

    var Ia2loc = gl.getUniformLocation( myShaderProgramTopTable, "Ia2");
    var Id2loc = gl.getUniformLocation( myShaderProgramTopTable, "Id2");
    var Is2loc = gl.getUniformLocation( myShaderProgramTopTable, "Is2");
    gl.uniform3f( Ia2loc, 0.1, 0.1, 0.1);
    gl.uniform3f( Id2loc, 0.8, 0.8, 0.5);
    gl.uniform3f( Is2loc, 0.8, 0.8, 0.8);
    // Initialize up on/off flags for the both light sources. These
    // flags should be controlled using buttons
    lightFlag1 = 1.0;
    lightFlag2 = 1.0;
    specFlag = 0.0;

    lightFlag1Location = gl.getUniformLocation(myShaderProgramTopTable,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    lightFlag2Location = gl.getUniformLocation(myShaderProgramTopTable,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    topTable = new objectClass(textureImage, url, numVertices, numTriangles, textureCoordinates ,myShaderProgramTopTable, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals);
}

function initBottomTable(){
    shaderProgramBottomTable = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaderProgramBottomTable );

    textureImage = gl.createTexture(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = "https://live.staticflickr.com/4512/26182715569_e5c652be77_b.jpg";
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    var textureCoordinates = getBottomTableTextureCoords();
    
    myImage.src = url;
    numVertices = 24;
    numTriangles = 12;
    var vertices = getBottomTableVertices(); // vertices and faces are defined in object.js
    var indexList = getBottomTableFaces();
    
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(shaderProgramBottomTable,"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(shaderProgramBottomTable,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(shaderProgramBottomTable,"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);
    
    
    // WORK ON THIS LAB IN TWO ITERATIONS
    // In the first iteration, do Steps 1 and 2 (i.e., do the Viewing portion)
    // and try to determine if you can see a silhouette (i.e., a filled outline)
    // of the chair. You will not see any inner detail, but you will at least know
    // that the chair is within the viewport. Make sure while doing this step
    // to apply the modelview and projection matrices in the vertex shader
    
    // In the second iteration, do Steps 3.1 (normal calculation and light setup), 3.2 (vertex
    // shader calculations for lighting, and steps 3.3 (fragment shader calculations
    // for lighting) so you can see the inner detail of the chair
    
    // FOLLOWING LINES IN STEPS 1 AND 2 NEED CODE FOR EACH COMMENT
    
    
    // Step 1: Position the camera using the look at method
    
    // Define eye (use vec3 in MV.js)
    var e = vec3(100.0, 40.0, 80.0);
    
    // Define at point (use vec3 in MV.js)
    var a = vec3(0.0, 0.0, 0.0);

    // Define vup vector (use vec3 in MV.js)
    var vup = vec3(0.0, 1.0, 0.0);
    // Obtain n (use subtract and normalize in MV.js)
    var n  = normalize( vec3( e[0]-a[0], e[1]-a[1], e[2]-a[2]));
    // Obtain u (use cross and normalize in MV.js)
    var u = normalize(cross(vup, n));
    // Obtain v (use cross and normalize in MV.js)
    var v = normalize(cross(n, u));
    // Set up Model-View matrix M and send M as uniform to shader
    var modelviewMatrix = [u[0], v[0], n[0], 0.0,
                            u[1], v[1], n[1], 0.0,
                            u[2], v[2], n[2], 0.0,
                        -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
                        -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
                        -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
     
    // Step 2: Set up orthographic and perspective projections
    var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
                                            u[1], v[1], n[1], e[1],
                                            u[2], v[2], n[2], e[2],
                                            0.0, 0.0, 0.0, 1.0];

    var modelviewMatrixLocation = gl.getUniformLocation(shaderProgramBottomTable, "modelview");
    gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
    var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(shaderProgramBottomTable,"modelviewInverseTranspose");
    gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
    
    // Define left plane
    //30
    var left = -40.0;
    // Define right plane
    var right = 40.0;
    // Define top plane
    var top = 40.0;
    // Define bottom plane
    var bottom = -40.0;
    // Define near plane
    //30
    var near = 50.0;
    // Define far plane
    //105
    var far = 130.0;
    // Set up orthographic projection matrix P_orth using above planes
    var P_orth = [2.0/(right-left), .0, .0, .0,
                    .0, 2.0/(top-bottom), .0, .0,
                .0, .0, -2.0/(far-near) , .0,
                -(left+right)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1.0]

    var orthographicProjectionMatrixLocation = gl.getUniformLocation(shaderProgramBottomTable, "P_orth");
    gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, P_orth);
    // Set up perspective projection matrix P_persp using above planes
    var P_persp = [2.0*near/(right-left), .0, .0, .0,
                    .0, 2.0*near/(top-bottom), .0, .0,
                    (right+left)/(right-left), (top+bottom)/(top-bottom), -(far+near)/(far-near), -1.0,
                    .0, .0, -2.0*far*near/ (far-near), .0];

    var perspectiveProjectionMatrixLocation = gl.getUniformLocation(shaderProgramBottomTable, "P_persp");
    gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, P_persp);
    // Use a flag to determine which matrix to send as uniform to shader
    // flag value should be changed by a button that switches between
    // orthographic and perspective projections

    shaderFlag = 1.0;
    

    
    
    
    // Step 3.1: Normals for lighting calculations
    
    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(shaderProgramBottomTable,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    
    // Set up coefficients for the object
    // (ambient coefficients, diffuse coefficients,
    // specular coefficients, shininess)
    // and send them as uniform variables to the shader program (NEEDS CODE)
    var kaloc = gl.getUniformLocation( shaderProgramBottomTable, "ka");
    var kdloc = gl.getUniformLocation( shaderProgramBottomTable, "kd");
    var ksloc = gl.getUniformLocation( shaderProgramBottomTable, "ks");
    gl.uniform3f( kaloc, 0.5, 0.5, 0.5);
    gl.uniform3f( kdloc, 0.5, 0.5, 0.5);
    gl.uniform3f( ksloc, 1.0, 1.0, 1.0);
    var alphaloc = gl.getUniformLocation( shaderProgramBottomTable, "alpha");
    gl.uniform1f(alphaloc, 4.0);
    
    // Set up the first light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    
    var p0loc = gl.getUniformLocation(shaderProgramBottomTable, "p0");
    gl.uniform3f( p0loc, 0.0, 140.0, 0.0);

    var Ialoc = gl.getUniformLocation( shaderProgramBottomTable, "Ia1");
    var Idloc = gl.getUniformLocation( shaderProgramBottomTable, "Id1");
    var Isloc = gl.getUniformLocation( shaderProgramBottomTable, "Is1");
    gl.uniform3f( Ialoc, 0.1, 0.1, 0.1);
    gl.uniform3f( Idloc, 0.8, 0.8, 0.5);
    gl.uniform3f( Isloc, 0.8, 0.8, 0.8);
    // Set up the second light source and send the variables
    // to the shader program (NEEDS CODE, VARIABLES DEPEND ON LIGHT TYPE)
    var p1loc = gl.getUniformLocation(shaderProgramBottomTable, "p1");
    gl.uniform3f( p1loc, 0.0, -150.0, 0.0);

    var Ia2loc = gl.getUniformLocation( shaderProgramBottomTable, "Ia2");
    var Id2loc = gl.getUniformLocation( shaderProgramBottomTable, "Id2");
    var Is2loc = gl.getUniformLocation( shaderProgramBottomTable, "Is2");
    gl.uniform3f( Ia2loc, 0.1, 0.1, 0.1);
    gl.uniform3f( Id2loc, 0.8, 0.8, 0.5);
    gl.uniform3f( Is2loc, 0.8, 0.8, 0.8);
    // Initialize up on/off flags for the both light sources. These
    // flags should be controlled using buttons
    lightFlag1 = 1.0;
    lightFlag2 = 1.0;
    specFlag = 0.0;

    lightFlag1Location = gl.getUniformLocation(shaderProgramBottomTable,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    lightFlag2Location = gl.getUniformLocation(shaderProgramBottomTable,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    //topTable = new objectClass(textureImage, "https://live.staticflickr.com/4512/26182715569_e5c652be77_b.jpg", numVertices, numTriangles, textureCoordinates ,myShaderProgramTopTable, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals);

    bottomTable = new objectClass(textureImage, url, numVertices, numTriangles, textureCoordinates, shaderProgramBottomTable, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals);
}



// FOLLOWING CODE SKELETON FOR getFaceNormals() NEEDS TO BE COMPLETED
function getFaceNormals( vertices, indexList, numTriangles ) {
    // array of face normals
    var faceNormals = [];
    var faceNormal = [];
    
    // Following lines iterate over triangles
    for (var i = 0; i < numTriangles; i++) {
        // Following lines give you three vertices for each face of the triangle
        var p0 = vec3( vertices[indexList[3*i]][0],
                      vertices[indexList[3*i]][1],
                      vertices[indexList[3*i]][2]);
        
        var p1 = vec3( vertices[indexList[3*i+1]][0],
                      vertices[indexList[3*i+1]][1],
                      vertices[indexList[3*i+1]][2]);
        
        var p2 = vec3( vertices[indexList[3*i+2]][0],
                      vertices[indexList[3*i+2]][1],
                      vertices[indexList[3*i+2]][2]);
        
        // Calculate vector from p0 to p1 ( use subtract function in MV.js, NEEDS CODE )
        var p1minusp0 = vec3( p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]);
        // Calculate vector from p0 to p2 ( use subtract function, NEEDS CODE )
        var p2minusp0 = vec3( p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]);
        // Calculate face normal as the cross product of the above two vectors
        // (use cross function in MV.js, NEEDS CODE )
        var faceNormal = cross(p1minusp0, p2minusp0);
        // normalize face normal (use normalize function in MV.js, NEEDS CODE)
        faceNormal = normalize(faceNormal);
        // Following line pushes the face normal into the array of face normals
        faceNormals.push( faceNormal );
    }
    
    // Following line returns the array of face normals
    return faceNormals;
}

// FOLLOWING CODE SKELETON FOR getVertexNormals() NEEDS TO BE COMPLETED
function getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles ) {
    var vertexNormals = [];
    
    // Iterate over all vertices
    for ( var j = 0; j < numVertices; j++) {
        
        // Initialize the vertex normal for the j-th vertex
        var vertexNormal = vec3( 0.0, 0.0, 0.0 );
        
        // Iterate over all the faces to find if this vertex belongs to
        // a particular face
        
        for ( var i = 0; i < numTriangles; i++ ) {
            
            // The condition of the following if statement should check
            // if the j-th vertex belongs to the i-th face
            if (indexList[3*i]==j | 
                indexList[3*i+1]==j | 
                indexList[3*i+2]==j ) { // NEEDS CODE IN PARENTHESES
                
                // Update the vertex normal (NEEDS CODE)
                vertexNormal[0] = vertexNormal[0] + faceNormals[i][0];
                vertexNormal[1] = vertexNormal[1] + faceNormals[i][1];
                vertexNormal[2] = vertexNormal[2] + faceNormals[i][2];
            }
            
        }
        
        // Normalize the vertex normal here (NEEDS CODE)
        vertexNormal = normalize(vertexNormal);
        
        
        // Following line pushes the vertex normal into the vertexNormals array
        vertexNormals.push( vertexNormal );
    }
    
    return vertexNormals;
    
}

// FOLLOWING CODE SKELETON FOR getFaceNormals() NEEDS TO BE COMPLETED
function getFaceNormals( vertices, indexList, numTriangles ) {
    // array of face normals
    var faceNormals = [];
    var faceNormal = [];
    
    // Following lines iterate over triangles
    for (var i = 0; i < numTriangles; i++) {
        // Following lines give you three vertices for each face of the triangle
        var p0 = vec3( vertices[indexList[3*i]][0],
                      vertices[indexList[3*i]][1],
                      vertices[indexList[3*i]][2]);
        
        var p1 = vec3( vertices[indexList[3*i+1]][0],
                      vertices[indexList[3*i+1]][1],
                      vertices[indexList[3*i+1]][2]);
        
        var p2 = vec3( vertices[indexList[3*i+2]][0],
                      vertices[indexList[3*i+2]][1],
                      vertices[indexList[3*i+2]][2]);
        
        // Calculate vector from p0 to p1 ( use subtract function in MV.js, NEEDS CODE )
        var p1minusp0 = vec3( p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]);
        // Calculate vector from p0 to p2 ( use subtract function, NEEDS CODE )
        var p2minusp0 = vec3( p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]);
        // Calculate face normal as the cross product of the above two vectors
        // (use cross function in MV.js, NEEDS CODE )
        var faceNormal = cross(p1minusp0, p2minusp0);
        // normalize face normal (use normalize function in MV.js, NEEDS CODE)
        faceNormal = normalize(faceNormal);
        // Following line pushes the face normal into the array of face normals
        faceNormals.push( faceNormal );
    }
    
    // Following line returns the array of face normals
    return faceNormals;
}

// FOLLOWING CODE SKELETON FOR getVertexNormals() NEEDS TO BE COMPLETED
function getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles ) {
    var vertexNormals = [];
    
    // Iterate over all vertices
    for ( var j = 0; j < numVertices; j++) {
        
        // Initialize the vertex normal for the j-th vertex
        var vertexNormal = vec3( 0.0, 0.0, 0.0 );
        
        // Iterate over all the faces to find if this vertex belongs to
        // a particular face
        
        for ( var i = 0; i < numTriangles; i++ ) {
            
            // The condition of the following if statement should check
            // if the j-th vertex belongs to the i-th face
            if (indexList[3*i]==j | 
                indexList[3*i+1]==j | 
                indexList[3*i+2]==j ) { // NEEDS CODE IN PARENTHESES
                
                // Update the vertex normal (NEEDS CODE)
                vertexNormal[0] = vertexNormal[0] + faceNormals[i][0];
                vertexNormal[1] = vertexNormal[1] + faceNormals[i][1];
                vertexNormal[2] = vertexNormal[2] + faceNormals[i][2];
            }
            
        }
        
        // Normalize the vertex normal here (NEEDS CODE)
        vertexNormal = normalize(vertexNormal);
        
        
        // Following line pushes the vertex normal into the vertexNormals array
        vertexNormals.push( vertexNormal );
    }
    
    return vertexNormals;
    
}

function drawObject() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    

    drawTopTable();
    

    drawTopChair();
    drawBottomChair();

    drawBottomTable();

    drawTeapot();

    requestAnimFrame(drawObject);
}

function drawTeapot(){
    gl.useProgram( program );

    if (xFlag == 1.0) {
        rotateAroundX();
    }
    if (yFlag == 1.0) {
        rotateAroundY();
    }
    if (zFlag == 1.0) {
        rotateAroundZ();
    }


    gl.enable(gl.DEPTH_TEST);

    numVertices = 531;
    numTriangles = 1062;

    var vertices = getVertices();
    var indexList = getFaces();

    

     // will populate to create buffer for indices
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);

    // Code here to handle putting above lists into buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var myPosition = gl.getAttribLocation(program, "vertexPosition");
    gl.vertexAttribPointer(myPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(myPosition);


    // Create face normals using faces and vertices by calling getFaceNormals
    var faceNormals = getFaceNormals( vertices, indexList, numTriangles );
    
    // Create vertex normals using faces, vertices, and face normals
    // by calling getVertexNormals
    var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles );
    
    // Following code sets up the normals buffer (NOTE: THERE IS AN INTENTIONAL
    // MISTAKE HERE, YOU WILL NEED TO FIND IT AND FIX IT!!)
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(program,"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );
    

    gl.drawElements( gl.TRIANGLES, 3 * teapotNumTriangles, gl.UNSIGNED_SHORT, 0 )
}

function drawTopChair(){
    gl.useProgram(topChair.getShader());

    textureImage = topChair.getTextureImage(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = topChair.getImageURL();
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    myImage.src = url;
    numVertices = topChair.getNumVertices();
    numTriangles = topChair.getNumTriangles();
    var vertices = getTopChairVertices(); // vertices and faces are defined in object.js
    var indexList = getTopChairFaces();
    
    
    var indexBuffer = topChair.getIndexBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = topChair.getVerticesBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(topChair.getShader(),"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = topChair.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(topChair.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = topChair.getTextureBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(topChair.getTextureCoordinates()), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(topChair.getShader(),"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    var normalsBuffer = topChair.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(topChair.getVertexNormals()), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(topChair.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    gl.drawElements( gl.TRIANGLES, 3 * topChair.getNumTriangles(), gl.UNSIGNED_SHORT, 0 );
}

function drawBottomChair(){
    gl.useProgram(bottomChair.getShader());

    textureImage = bottomChair.getTextureImage(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = bottomChair.getImageURL();
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    myImage.src = url;

    numVertices = bottomChair.getNumVertices();
    numTriangles = bottomChair.getNumTriangles();
    var vertices = getBottomChairVertices(); // vertices and faces are defined in object.js
    var indexList = getBottomChairFaces();
    
    
    var indexBuffer = bottomChair.getIndexBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = bottomChair.getVerticesBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(bottomChair.getShader(),"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = bottomChair.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(bottomChair.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = bottomChair.getTextureBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bottomChair.getTextureCoordinates()), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(bottomChair.getShader(),"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    var normalsBuffer = bottomChair.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bottomChair.getVertexNormals()), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(bottomChair.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    gl.drawElements( gl.TRIANGLES, 3 * bottomChair.getNumTriangles(), gl.UNSIGNED_SHORT, 0 );
}

function drawTopTable(){
    gl.useProgram(topTable.getShader());

    textureImage = topTable.getTextureImage(); // for flower image
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = topTable.getImageURL();
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    myImage.src = url;
    numVertices = topChair.getNumVertices();
    numTriangles = topChair.getNumTriangles();
    var vertices = getTopTableVertices(); // vertices and faces are defined in object.js
    var indexList = getTopTableFaces();
    
    
    var indexBuffer = topTable.getIndexBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = topTable.getVerticesBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(topTable.getShader(),"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = topTable.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(topTable.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = topTable.getTextureBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(topTable.getTextureCoordinates()), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(topTable.getShader(),"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    var normalsBuffer = topTable.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(topTable.getVertexNormals()), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(topTable.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    gl.drawElements( gl.TRIANGLES, 3 * topTable.getNumTriangles(), gl.UNSIGNED_SHORT, 0 );
}

function drawBottomTable(){
    gl.useProgram(bottomTable.getShader());

    textureImage = bottomTable.getTextureImage(); 
    gl.bindTexture( gl.TEXTURE_2D, textureImage );
    const myImage = new Image();
    var url = bottomTable.getImageURL();
    myImage.crossOrigin = "anonymous";

    myImage.onload = function() {
        gl.bindTexture( gl.TEXTURE_2D, textureImage );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2
        return textureImage;
    };

    myImage.src = url;

    numVertices = bottomTable.getNumVertices();
    numTriangles = bottomTable.getNumTriangles();
    var vertices = getBottomTableVertices(); // vertices and faces are defined in object.js
    var indexList = getBottomTableFaces();
    
    
    var indexBuffer = bottomTable.getIndexBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
    
    var verticesBuffer = bottomTable.getVerticesBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vertexPosition = gl.getAttribLocation(bottomTable.getShader(),"vertexPosition");
    gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    
    var normalsBuffer = bottomTable.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
    var vertexNormal = gl.getAttribLocation(bottomTable.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    var textureBuffer = bottomTable.getTextureBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bottomTable.getTextureCoordinates()), gl.STATIC_DRAW);
    
    var textureCoordinate = gl.getAttribLocation(bottomTable.getShader(),"textureCoordinate");
    gl.vertexAttribPointer(textureCoordinate,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(textureCoordinate);

    var normalsBuffer = bottomTable.getNormalsBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bottomTable.getVertexNormals()), gl.STATIC_DRAW);
    
    var vertexNormal = gl.getAttribLocation(bottomTable.getShader(),"vertexNormal");
    gl.vertexAttribPointer( vertexNormal,3 , gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexNormal );

    gl.drawElements( gl.TRIANGLES, 3 * bottomTable.getNumTriangles(), gl.UNSIGNED_SHORT, 0 );
}

// Write a script for changing the perspective / orthographic flag
// using a button here
function showOrthographic(){
    shaderFlag = 1.0;
    gl.useProgram(topChair.getShader());
    shaderFlagLocation = gl.getUniformLocation(topChair.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);
    

    gl.useProgram(bottomChair.getShader());
    shaderFlagLocation = gl.getUniformLocation(bottomChair.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(topTable.getShader());
    shaderFlagLocation = gl.getUniformLocation(topTable.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);
    

    gl.useProgram(bottomTable.getShader());
    shaderFlagLocation = gl.getUniformLocation(bottomTable.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(program);
    shaderFlagLocation = gl.getUniformLocation(program,"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);
}

function showPerspective(){
    shaderFlag = 0.0;

    gl.useProgram(topChair.getShader());
    shaderFlagLocation = gl.getUniformLocation(topChair.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(bottomChair.getShader());
    shaderFlagLocation = gl.getUniformLocation(bottomChair.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(topTable.getShader());
    shaderFlagLocation = gl.getUniformLocation(topTable.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(bottomTable.getShader());
    shaderFlagLocation = gl.getUniformLocation(bottomTable.getShader(),"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);

    gl.useProgram(program);
    shaderFlagLocation = gl.getUniformLocation(program,"shaderFlag");
    gl.uniform1f(shaderFlagLocation, shaderFlag);
}


// Write a script for switching on / off the first light source flag
// using a button here

function lightOneToggle(){
    if (lightFlag1 == 0.0){
        lightFlag1 = 1.0;
    }else{
        lightFlag1 = 0.0;
    }

    gl.useProgram(topChair.getShader());
    lightFlag1Location = gl.getUniformLocation(topChair.getShader(),"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    gl.useProgram(bottomChair.getShader());
    lightFlag1Location = gl.getUniformLocation(bottomChair.getShader(),"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    gl.useProgram(topTable.getShader());
    lightFlag1Location = gl.getUniformLocation(topTable.getShader(),"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    gl.useProgram(bottomTable.getShader());
    lightFlag1Location = gl.getUniformLocation(bottomTable.getShader(),"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);

    gl.useProgram(program);
    lightFlag1Location = gl.getUniformLocation(program,"lightFlag1");
    gl.uniform1f(lightFlag1Location, lightFlag1);
}

// Write a script for switching on / off the second light source flag
// using a button here

function lightTwoToggle(){
    if (lightFlag2 == 0.0){
        lightFlag2 = 1.0;
    }else{
        lightFlag2 = 0.0;
    }

    gl.useProgram(topChair.getShader());
    lightFlag2Location = gl.getUniformLocation(topChair.getShader(),"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    gl.useProgram(bottomChair.getShader());
    lightFlag2Location = gl.getUniformLocation(bottomChair.getShader(),"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    gl.useProgram(topTable.getShader());
    lightFlag2Location = gl.getUniformLocation(topTable.getShader(),"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    gl.useProgram(bottomTable.getShader());
    lightFlag2Location = gl.getUniformLocation(bottomTable.getShader(),"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);

    gl.useProgram(program);
    lightFlag2Location = gl.getUniformLocation(program,"lightFlag2");
    gl.uniform1f(lightFlag2Location, lightFlag2);
}

function specularToggle(){
    if (specFlag == 0.0){
        specFlag = 1.0;
    }else{
        specFlag = 0.0;
    }

    gl.useProgram(topChair.getShader());
    specFlagLocation = gl.getUniformLocation(topChair.getShader(),"specFlag");
    gl.uniform1f(specFlagLocation, specFlag);

    gl.useProgram(bottomChair.getShader());
    specFlagLocation = gl.getUniformLocation(bottomChair.getShader(),"specFlag");
    gl.uniform1f(specFlagLocation, specFlag);

    gl.useProgram(topTable.getShader());
    specFlagLocation = gl.getUniformLocation(topTable.getShader(),"specFlag");
    gl.uniform1f(specFlagLocation, specFlag);

    gl.useProgram(bottomTable.getShader());
    specFlagLocation = gl.getUniformLocation(bottomTable.getShader(),"specFlag");
    gl.uniform1f(specFlagLocation, specFlag);

    gl.useProgram(program);
    specFlagLocation = gl.getUniformLocation(program,"specFlag");
    gl.uniform1f(specFlagLocation, specFlag);
}

//dictates which key was pressed for rotate and toggles flag for specified axis
function rotateWithKeys(event) {
    var theKeyCode = event.keyCode;
   
    if (theKeyCode == 65) {

        //on press of a
        if (xFlag == 1.0) {
            xFlag = 0.0;
        } else {
            xFlag = 1.0;
        }

    } else if (theKeyCode == 83) {

        //on press of s
        if (yFlag == 1.0) {
            yFlag = 0.0;
        } else {
            yFlag = 1.0;
        }

    } else if (theKeyCode == 68) {

        //on press of d
        if (zFlag == 1.0) {
            zFlag = 0.0;
        } else {
            zFlag = 1.0;
        }
    } else if (theKeyCode == 81) {
        //Q pressed
        tranX();
    } else if (theKeyCode == 87) {
        //W pressed
        tranY();
    } else if (theKeyCode == 82) {
        //R pressed
        scaleX();
    } else if (theKeyCode == 70) {
        //F pressed
        scaleY();
    }
    
}

//Scale function for X
function scaleX() {
    sxValue += 0.05;
    gl.useProgram(program);
    gl.uniform1f(sxUniform, sxValue);
}

//Scale function for Y
function scaleY() {
    syValue += 0.05;
    gl.useProgram(program);
    gl.uniform1f(syUniform, syValue);
}

//Translation function for X Direction
function tranX() {
    txValue += 0.05;
    gl.useProgram(program);
    gl.uniform1f(txUniform, txValue);
}

//Translation function for Y Direction
function tranY() {
    tyValue += 0.05;
    gl.useProgram(program);
    gl.uniform1f(tyUniform, tyValue);
}

//rotation function X direction
function rotateAroundX() {
    alphaValue += 0.05 * xFlag;
    gl.useProgram(program);
    gl.uniform1f(alphaUniform, alphaValue); 
}

//rotation function Y direction
function rotateAroundY() {
    betaValue += 0.05 * yFlag;
    gl.useProgram(program);
    gl.uniform1f(betaUniform, betaValue);

}

//rotation function Z direction
function rotateAroundZ() {
    chiValue += 0.05 * zFlag;
    gl.useProgram(program);
    gl.uniform1f(chiUniform, chiValue);

}