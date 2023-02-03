export class sceneDef {
    constructor(imageWidth, imageHeight, exposure, backgroundColor, ambientLight, maxDepth, camera, shapes, lights, environment, antiAliasing, superSamplingScale, ambientOcclusionSamples) {

        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.exposure = exposure;
        this.backgroundColor = backgroundColor;
        this.ambientLight = ambientLight;
        this.maxDepth =  maxDepth;
        this.camera = camera;
        this.shapes = shapes;
        this.lights = lights;
        this.environment = environment;
        this.antiAliasing = antiAliasing;
        this.superSamplingScale = superSamplingScale;
        this.ambientOcclusionSamples = ambientOcclusionSamples;
    }

}