import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function ImageViewer({ url }: { url: string }) {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={url}
            alt="Viewer content"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
