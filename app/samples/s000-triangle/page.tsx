'use client';

import { useRef } from "react";

const ShaderCode = `
@vertex
fn vsMain(
  @builtin(vertex_index) vi : u32
) -> @builtin(position) vec4f
{
  var pos = array<vec2f, 3>(
    vec2f( 0.0,  0.5), // center top
    vec2f(-0.5, -0.5), // left bottom
    vec2f( 0.5, -0.5)  // right bottom
  );

  return vec4f(pos[vi], 0.0, 1.0);
}

@fragment
fn fsMain() -> @location(0) vec4f
{
  return vec4(1.0, 0.0, 1.0, 1.0);
}
`;

export default function S000_TriangleSample()
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const runSample = async () =>
    {
        console.log('Run WebGPU Sample...');

        if (!navigator.gpu)
        {
            throw Error("No WebGPU Support :(");
        }

        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        const canvas = canvasRef.current;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        
        const context = canvas.getContext('webgpu') as GPUCanvasContext;
        context.configure({
            device,
            format: presentationFormat,
            alphaMode: 'opaque'
        });

        const shaderModule = device.createShaderModule({
            label: "Simple Triangle Shader",
            code: ShaderCode
        });

        const pipeline = await device.createRenderPipelineAsync({
            label: "Simple Render Pipeline for Triangle",

            layout: 'auto',

            vertex: {
                module: shaderModule,
                entryPoint: 'vsMain',
            },

            fragment: {
                module: shaderModule,
                entryPoint: 'fsMain',
                targets: [
                    {
                        format: presentationFormat
                    }
                ],
            },

            primitive: {
                topology: 'triangle-list'
            },
        });

        console.log('Render Pipeline created.');

        const renderPassDescriptor : GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: null,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        // How to put into own class?
        function RenderFrame()
        {
            const textureView = context.getCurrentTexture().createView();
            renderPassDescriptor.colorAttachments[0].view = textureView;
            
            const commandEncoder = device.createCommandEncoder();
            const pass = commandEncoder.beginRenderPass(renderPassDescriptor);
        
            pass.setPipeline(pipeline);
            pass.draw(3, 1, 0, 0); // 3 vertices, 1 instance...
            pass.end();
        
            device.queue.submit([commandEncoder.finish()]);
        
            requestAnimationFrame(RenderFrame);
        }

        requestAnimationFrame(RenderFrame);

    }

    // TODO The better alternative would be to use the useEffect() hook to start rendering webgpu
    // content after the html elements have been rendered but when doing this we get WebGPU erros
    // complaining about that we cannot use the TextureView with the current device. Why??
    // The same is true when we hit multiple times the Render button :(

    function StartRendering(e)
    {
        e.preventDefault();
        runSample().catch(console.error);
    }

    return (
        <>
            <h1>S000 - Triangle Sample</h1>
            <p>Renders a basic triangle.</p>
            <button onClick={StartRendering}>Start Rendering</button>
            <canvas ref={canvasRef} />
        </>
    )
}