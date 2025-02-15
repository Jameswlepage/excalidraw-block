import React, { useRef, useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

import {
  Excalidraw,
  exportToSvg,
} from '@excalidraw/excalidraw';


export default function Edit(props) {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps({
    className: 'my-excalidraw-block-editor'
  });

  const excalidrawRef = useRef(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  // This will parse the saved `excalidrawData` JSON string
  // into initialData for the Excalidraw component.
  const initialData = React.useMemo(() => {
    if (!attributes.excalidrawData) {
      return null;
    }
    try {
      return JSON.parse(attributes.excalidrawData);
    } catch (err) {
      return null;
    }
  }, [attributes.excalidrawData]);

  // Whenever Excalidraw changes, update the block attributes
  const onChange = useCallback(async () => {
    if (!excalidrawAPI) {
      return;
    }

    // Grab scene elements, appState, files
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    // Store the entire scene as JSON:
    const sceneData = {
      elements,
      appState,
      files,
    };
    setAttributes({ excalidrawData: JSON.stringify(sceneData) });

    // Export an SVG and store it in attributes for the frontend
    const svg = await exportToSvg({
      elements,
      appState,
      files,
    });
    // Convert the SVG Element to a string
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    setAttributes({ exportedSvg: svgStr });
  }, [excalidrawAPI, setAttributes]);

  return (
    <div {...blockProps}>
      <p><strong>{ __('Excalidraw Editor (Backend View)', 'my-excalidraw-block') }</strong></p>
      <Excalidraw
        // we store a ref to access the Excalidraw API
        ref={(api) => {
          setExcalidrawAPI(api);
        }}
        // we pass the initial data (restored from attributes) into Excalidraw
        initialData={initialData || undefined}
        onChange={onChange}
      />
    </div>
  );
}
