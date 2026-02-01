import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function ImageViewer({ url }: { url: string }) {
  return (
    <TransformWrapper
      minScale={0.5}
      maxScale={4}
      wheel={{ step: 0.1 }}
      panning={{ velocityDisabled: true }}
      doubleClick={{ disabled: true }}
    >
      <TransformComponent>
        <img
          src={url}
          draggable={false}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </TransformComponent>
    </TransformWrapper>
  );
}
