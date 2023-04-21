class objectClass{
    constructor(textureImage, imageURL, numVertices, numTriangles, textureCoordinates, shader, indexBuffer, verticesBuffer, normalsBuffer, textureBuffer, faceNormals, vertexNormals){
        this.textureImage = textureImage;
        this.imageURL = imageURL;
        this.numVertices = numVertices;
        this.numTriangles = numTriangles;
        this.textureCoordinates = textureCoordinates;
        this.shader = shader;
        this.indexBuffer = indexBuffer;
        this.verticesBuffer = verticesBuffer;
        this.normalsBuffer = normalsBuffer;
        this.textureBuffer = textureBuffer;
        this.faceNormals = faceNormals;
        this.vertexNormals = vertexNormals;
    }


    getTextureImage(){
        return this.textureImage;
    }

    getImageURL(){
        return this.imageURL;
    }

    getNumVertices(){
        return this.numVertices;
    }
    
    getNumTriangles(){
        return this.numTriangles;
    }

    getTextureCoordinates(){
        return this.textureCoordinates;
    }

    getShader(){
        return this.shader;
    }

    getIndexBuffer(){
        return this.indexBuffer;
    }

    getVerticesBuffer(){
        return this.verticesBuffer;
    }

    getNormalsBuffer(){
        return this.normalsBuffer;
    }

    getTextureBuffer(){
        return this.textureBuffer;
    }

    getFaceNormals(){
        return this.faceNormals;
    }

    getVertexNormals(){
        return this.vertexNormals;
    }
}