
  /**
   *  Map js
   */

  var Map = cdb.core.View.extend({

    options: {
      zoom:     2,
      center:   [30,-20],
      viz_url:  'https://icij.cartodb.com/api/v2/viz/bec546fa-61a8-11e3-858d-1bc60dd419cf/viz'
    },

    events: {
      'click h2 a':           '_onHeadClick',
      'click div.aside li a': '_onClick'
    },

    initialize: function() {
      _.bindAll(this, '_onDone', '_onHeadClick');
      this._initMap();
    },

    _initMap: function() {
      cartodb.createVis(
        this.$('#map')[0],
        this.options.viz_url,
        {
          zoom: this.options.zoom,
          center: this.options.center
        }
      )
      .done(this._onDone)
      .error(this._onError)
    },

    _onDone: function(vis,layers) {
      var layer = layers[1];
      layer.infowindow.set('offset', [224,0]);
        
      this.choroplethCountries = layer.getSubLayer(0);

      this.choroplethCircles = layer.getSubLayer(1);
      this.choroplethCircles.hide();

      this.stories = layer.getSubLayer(2);

      this.stories.infowindow.set({
        template: this.options.template
      })
    },

    _onError: function(e) {
      console.log('There was a problem generating visualization from vis.json');
    },

    _toggleStories: function(bool) {
      this.stories[bool ? 'show' : 'hide']();
      if(bool){
        this.choroplethCountries.setCartoCSS('#countries_heavens_officer_and_officer_master_g_1{ polygon-fill: #7C2E00; polygon-opacity: 1; line-color: #4D1C00; line-width: 0.6; line-opacity: 1;}');
      }else{
        this.choroplethCountries.setCartoCSS('#countries_heavens_officer_and_officer_master_g_1{ polygon-fill: #7C2E00; polygon-opacity: 1; line-color: #4D1C00; line-width: 0.6; line-opacity: 1; } #countries_heavens_officer_and_officer_master_g_1[c=null]{polygon-opacity: 0.9; }');
      }
      this.choroplethCircles[!bool ? 'show' : 'hide']();
    },

    _onHeadClick: function(e) {
      if (e) e.preventDefault();
      this.trigger('onHeadClick', this);
    },

    _onClick: function(e) {
      var $a = $(e.target);
      e.stopPropagation();
      
      if ($a.find('span.info').length > 0) {
        e.preventDefault();
        
        // Select correct item
        if (!$a.hasClass('selected'))
          this._openItem($a);

        // Toggle stories
        this._toggleStories($a.hasClass('stories'))
      }
    },

    _openItem: function($a) {
      this.$('a').removeClass('selected');
      $a.addClass('selected');
    }

  });