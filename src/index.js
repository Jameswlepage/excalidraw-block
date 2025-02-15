import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import './editor.scss';
import './style.scss';

import Edit from './edit';
import save from './save';

registerBlockType('excalidraw-block/editor', {
  title: __('Excalidraw Block', 'excalidraw-block'),
  description: __('Embed an Excalidraw editor in the post editor.', 'excalidraw-block'),
  icon: 'edit',
  category: 'widgets',

  // We could define attributes here, but we've already done so in block.json,
  // so let's keep them in one place.

  edit: Edit,
  save,
});
