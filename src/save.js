import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

export default function save(props) {
  const { attributes } = props;
  const blockProps = useBlockProps.save();

  // If there's no exportedSvg yet, render nothing or a placeholder
  if (!attributes.exportedSvg) {
    return <div {...blockProps}>No diagram yet.</div>;
  }

  // Danger: we’re directly inserting the raw SVG string.
  // Alternatively, you could do data-URL <img src=...>
  return (
    <div
      {...blockProps}
      dangerouslySetInnerHTML={{ __html: attributes.exportedSvg }}
    />
  );
}
