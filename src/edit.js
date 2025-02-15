import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

import {
  Excalidraw,
  exportToSvg,
} from '@excalidraw/excalidraw';

export default function Edit(props) {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps({ className: 'my-excalidraw-block-editor' });

  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const timeoutRef = useRef(null);

  // 1. Parse the saved excalidrawData JSON string
  const initialData = useMemo(() => {
    if (!attributes.excalidrawData) {
      return null;
    }
    try {
      return JSON.parse(attributes.excalidrawData);
    } catch (err) {
      console.error('Failed to parse excalidraw data:', err);
      return null;
    }
  }, [attributes.excalidrawData]);

  // 2. Save the diagram data and SVG
  const saveData = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      // Prepare scene data
      const sceneData = {
        elements,
        appState: {
          ...appState,
          viewBackgroundColor: '#ffffff',
          exportWithDarkMode: false,
        },
        files,
      };

      // Generate SVG
      const svg = await exportToSvg({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          exportWithDarkMode: false,
          viewBackgroundColor: '#ffffff',
        },
        files,
        exportPadding: 10,
      });

      // Convert SVG to string
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);

      // Update block attributes
      setAttributes({
        excalidrawData: JSON.stringify(sceneData),
        exportedSvg: svgStr,
      });
    } catch (error) {
      console.error('Error saving Excalidraw data:', error);
    }
  }, [excalidrawAPI, setAttributes]);

  // 3. Debounced onChange handler
  const onChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, 500);
  }, [saveData]);

  // 4. Clean up timeout on unmount and do a final save
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveData();
    };
  }, [saveData]);

  // 5. Save once the Excalidraw API is available
  useEffect(() => {
    if (excalidrawAPI) {
      saveData();
    }
  }, [excalidrawAPI, saveData]);

  return (
    <div {...blockProps}>
      <div
        className="excalidraw-wrapper"
        style={{
          height: '500px',
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <Excalidraw
          // NOTE: Use excalidrawAPI={(api) => setExcalidrawAPI(api)} instead of ref
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={onChange}
          onPointerUp={onChange}
        />
      </div>
    </div>
  );
}
