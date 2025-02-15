<?php
/**
 * Plugin Name: My Excalidraw Block
 * Description: A Gutenberg block that embeds Excalidraw in the editor, and outputs an SVG on the frontend.
 * Version: 1.0.0
 * Author: You
 * Text Domain: my-excalidraw-block
 */

defined( 'ABSPATH' ) || exit;

function my_excalidraw_block_register_block() {
    // Uses block.json metadata to register the block and automatically
    // loads built scripts and styles.
    register_block_type(
        __DIR__ . '/block.json'
    );
}
add_action( 'init', 'my_excalidraw_block_register_block' );
