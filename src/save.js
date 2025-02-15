import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

export default function save(props) {
  const { attributes } = props;
  const blockProps = useBlockProps.save({
    className: 'excalidraw-block'
  });

  // Calculate aspect ratio styles
  const containerStyle = {
    minHeight: '100px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...(attributes.showBorder && {
      border: '1px solid #ddd',
      padding: '1rem',
    }),
  };

  // Add aspect ratio if not auto
  if (attributes.aspectRatio !== 'auto') {
    const [width, height] = attributes.aspectRatio.split(':').map(Number);
    containerStyle.position = 'relative';
    containerStyle.paddingTop = `${(height / width) * 100}%`;
  }

  return (
    <div {...blockProps}>
      <div 
        className="excalidraw-svg-container"
        style={containerStyle}
        dangerouslySetInnerHTML={
          attributes.exportedSvg 
            ? { __html: attributes.exportedSvg }
            : undefined
        }
        role="img"
        aria-label={attributes.altText}
      />
      {attributes.caption && (
        <figcaption className="excalidraw-caption">
          {attributes.caption}
        </figcaption>
      )}
    </div>
  );
}
