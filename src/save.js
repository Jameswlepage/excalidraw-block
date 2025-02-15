import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

export default function save(props) {
  const { attributes } = props;
  const blockProps = useBlockProps.save({
    className: 'my-excalidraw-block'
  });

  // Always render a container, even if empty
  return (
    <div {...blockProps}>
      <div 
        className="excalidraw-svg-container"
        style={{ 
          minHeight: '100px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        dangerouslySetInnerHTML={
          attributes.exportedSvg 
            ? { __html: attributes.exportedSvg }
            : undefined
        }
      />
    </div>
  );
}
