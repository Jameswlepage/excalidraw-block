import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  TextareaControl,
  ToggleControl,
} from '@wordpress/components';

import {
  Excalidraw,
  exportToSvg,
  MainMenu,
} from '@excalidraw/excalidraw';

export default function Edit(props) {
  const { attributes, setAttributes } = props;
  const blockProps = useBlockProps({ className: 'my-excalidraw-block-editor' });

  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const timeoutRef = useRef(null);

  // 1. Parse the saved excalidrawData JSON string
  const initialData = useMemo(() => {
    const defaultAppState = {
      viewBackgroundColor: '#ffffff',
      exportWithDarkMode: false,
      exportBackground: true,
      gridSize: null,
      scrollX: 0,
      scrollY: 0,
      zoom: {
        value: 1,
      },
      collaborators: new Map(),
    };

    if (!attributes.excalidrawData) {
      return {
        elements: [],
        appState: defaultAppState,
        files: {},
      };
    }

    try {
      const parsed = JSON.parse(attributes.excalidrawData);
      return {
        elements: parsed.elements || [],
        appState: {
          ...defaultAppState,
          ...(parsed.appState || {}),
          collaborators: new Map(), // Always ensure this is a new Map
        },
        files: parsed.files || {},
      };
    } catch (err) {
      console.error('Failed to parse excalidraw data:', err);
      return {
        elements: [],
        appState: defaultAppState,
        files: {},
      };
    }
  }, [attributes.excalidrawData]);

  // 2. Save the diagram data and SVG
  const saveData = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      // Prepare scene data - ensure we don't try to stringify the collaborators Map
      const sceneData = {
        elements,
        appState: {
          ...appState,
          viewBackgroundColor: '#ffffff',
          exportWithDarkMode: false,
          collaborators: {}, // Convert Map to plain object for storage
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
    <>
      <InspectorControls>
        <PanelBody title={__('Display Settings', 'my-excalidraw-block')}>
          <SelectControl
            label={__('Aspect Ratio', 'my-excalidraw-block')}
            value={attributes.aspectRatio}
            options={[
              { label: __('Auto', 'my-excalidraw-block'), value: 'auto' },
              { label: '16:9', value: '16:9' },
              { label: '4:3', value: '4:3' },
              { label: '1:1', value: '1:1' },
            ]}
            onChange={(aspectRatio) => setAttributes({ aspectRatio })}
          />
          <ToggleControl
            label={__('Show Border', 'my-excalidraw-block')}
            checked={attributes.showBorder}
            onChange={(showBorder) => setAttributes({ showBorder })}
          />
          <TextareaControl
            label={__('Alt Text', 'my-excalidraw-block')}
            help={__('Describe the purpose of this image', 'my-excalidraw-block')}
            value={attributes.altText}
            onChange={(altText) => setAttributes({ altText })}
          />
          <TextareaControl
            label={__('Caption', 'my-excalidraw-block')}
            help={__('Add a caption below the image', 'my-excalidraw-block')}
            value={attributes.caption}
            onChange={(caption) => setAttributes({ caption })}
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <div
          className="excalidraw-wrapper"
          style={{
            height: '500px',
            width: '100%',
          }}
        >
          <Excalidraw
            // NOTE: Use excalidrawAPI={(api) => setExcalidrawAPI(api)} instead of ref
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            onChange={onChange}
            onPointerUp={onChange}
          >
            <MainMenu>
              <MainMenu.ItemLink href="https://wordpress.org">
                WordPress
              </MainMenu.ItemLink>
              <MainMenu.ItemLink href="https://j.cv">
                James' Website
              </MainMenu.ItemLink>
            </MainMenu>
          </Excalidraw>
        </div>
      </div>
    </>
  );
}
