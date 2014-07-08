//StoryJS Embed Loader
// Provide a bootstrap method for instantiating a timeline. On page load, check the definition of these window scoped variables in this order: [url_config, timeline_config, storyjs_config, config]. As soon as one of these is found to be defined with type 'object,' it will be used to automatically instantiate a timeline.



var storyjs_embedjs,
	storyjs_e_config = {
		debug:		false,
		type:		'timeline',
		id:			'storyjs',
		embed_id:	'timeline-embed',
		embed:		true,
		width:		'100%',
		height:		'100%',
		source:		'https://docs.google.com/spreadsheet/pub?key=0Agl_Dv6iEbDadFYzRjJPUGktY0NkWXFUWkVIZDNGRHc&output=html',
		lang:		'en',
		font:		'default',
		js:			'',
		type: 'timeline',
         width: "100%",
         height: "100%",
         source: 'example_json.json',
         start_at_slide: '4',
		api_keys: {
			google:				"",
			flickr:				"",
			twitter:			""
		},
		gmap_key: 	""
	};
		
VMM.debug = storyjs_e_config.debug;
storyjs_embedjs = new VMM.Timeline(storyjs_e_config.id);
storyjs_embedjs.init(storyjs_e_config);
