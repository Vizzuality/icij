/*
    Fullscreen background is a small jQuery plugin that allows you to create fullscreen background.

    Author:     Gaya Kessler
    Date:       04-25-2012
    URL:        http://www.gayadesign.com
*/

(function ($) {
    var parentElement = "";
    var optionsArr = {
        selector: "img",
        fillOnResize: true,
        defaultCss: true
    };

    $.fn.fullscreenBackground = function (options) {
        if(options) {
            $.extend(optionsArr, options );
        }

        this.each(function () {
            parentElement = this;

            if (optionsArr.defaultCss == true) {
                $("html,body").css({
                    width: "100%",
                    height: "100%"
                });

                $(parentElement).css({
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                    position: "fixed",
                    top: "0px",
                    left: "0px",
                    zIndex: 1
                });
            }

            if (optionsArr.fillOnResize == true) {
                $(window).resize(function () {
                    fillBg(optionsArr.selector, parentElement);
                });
            }

            fillBg(optionsArr.selector, parentElement);
        });
    };

    function fillBg(selector, parentobj) {
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();

        $(selector, parentobj).each(function () {
            var imgHeight = $(this).attr("height");
            var imgWidth = $(this).attr("width");

            var newWidth = windowWidth;
            var newHeight = (windowWidth / imgWidth) * imgHeight;
            var topMargin = ((newHeight - windowHeight) / 2) * -1;
            var leftMargin = 0;

            if (newHeight < windowHeight) {
                var newWidth = (windowHeight / imgHeight) * imgWidth;
                var newHeight = windowHeight;
                var topMargin = 0;
                var leftMargin = ((newWidth - windowWidth) / 2) * -1;
            }

            $(this).css({
                height: newHeight + "px",
                width: newWidth + "px",
                marginLeft: leftMargin + "px",
                marginTop: topMargin + "px",
                display: "block"
            });
        });
    }
})(jQuery);
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
      'click .triggered':               '_onClickTriggered',
      'click h2 a':                     '_onHeadClick',
      'click div.aside li > a.option':  '_onClick'
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
      this.map = vis.getNativeMap();
      this.map.attributionControl.removeAttribution("CartoDB <a href='http://cartodb.com/attributions' target='_blank'>attribution</a>");

      this.layer = layers[1];
      this.layer.infowindow.set('offset', [224,0]);

      this.choroplethCountries = this.layer.getSubLayer(0);

      this.choroplethCircles = this.layer.getSubLayer(1);
      this.choroplethCircles.infowindow.set({
        template: this.options.officers_template
      });
      this.choroplethCircles.hide();
      
      this.stories = this.layer.getSubLayer(2);
      this.stories.infowindow.set({
        template: this.options.stories_template
      })
    },

    _onError: function(e) {
      console.log('There was a problem generating visualization from vis.json');
    },

    _toggleStories: function(bool) {
      // Toggle layers
      this.choroplethCircles[!bool ? 'show' : 'hide']();
      this.stories[bool ? 'show' : 'hide']();

      // Change offset and visibility of
      // the infowindow depending
      // which layer we are visualizing
      this.layer.infowindow.set({
        offset: bool ? [224,0] : [25,0],
        visibility: false
      });

      // Change CartoCSS
      if (bool){
        this.choroplethCountries.setCartoCSS('#countries_heavens_officer_and_officer_master_g_1{ polygon-fill: #A74428; polygon-opacity: 1; line-color: #7F331E; line-width: 0.6; line-opacity: 1;}');
      }else{
        this.choroplethCountries.setCartoCSS('#countries_heavens_officer_and_officer_master_g_1{ polygon-fill: #A74428; polygon-opacity: 1; line-color: #7F331E; line-width: 0.6; line-opacity: 1; } #countries_heavens_officer_and_officer_master_g_1[c=null]{polygon-opacity: 0.8; }');
      }
    },

    _onClickTriggered: function() {
      window.location.href = 'http://www.icij.org/offshore'
    },

    _onHeadClick: function(e) {
      if (e) e.preventDefault();
      this.trigger('onHeadClick', this);
    },

    _onClick: function(e) {
      var $a = $(e.target).closest('a');
      e.preventDefault();
      
      if (!$a.hasClass('selected') && $a.find('span.info').length > 0) {
        
        // Select correct item
        if (!$a.hasClass('selected'))
          this._openItem($a);

        // Toggle stories
        this._toggleStories($a.hasClass('stories'))
      }
    },

    _openItem: function($a) {
      this.$('a.option').removeClass('selected');
      $a.addClass('selected');
    }

  });


  cdb.geo.ui.Infowindow = cdb.geo.ui.Infowindow.extend({

    render: function() {

      if(this.template) {

        // Clone fields and template name
        var fields = _.map(this.model.attributes.content.fields, function(field){
          return _.clone(field);
        });

        var data = this.model.get('content') ? this.model.get('content').data : {};
        fields = this._fieldsToString(fields, "");

        // Join plan fields values with content to work with
        // custom infowindows and CartoDB infowindows.
        var values = {};
        _.each(fields, function(pair) {
          values[pair.title] = pair.value;
        })

        var obj = _.extend({
            content: {
              fields: fields,
              data: data
            }
          },values);

        this.$el.html(this.template(obj));

        // If the infowindow is loading, show spin
        this._checkLoading();
      }

      return this;
    },

    _sanitizeField: function(attr, template_name, pos) {
      if (_.isNumber(attr.value)) {
        attr.value = this._numberWithCommas(attr.value);
      }

      return attr;
    },

    _numberWithCommas: function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

  });

  $(function() {

    var App = cdb.core.View.extend({

      el: document.body,

      events: {
        'click #explore': '_toggleLanding'
      },

      initialize: function() {
        this.model = new cdb.core.Model({ state: 'landing' });
        this._initViews();
        if(getURLParameter('target') == 'map'){
          this._toggleLanding();
        }
      },

      _initViews: function() {
        // Map
        this.map = new Map({
          el:                 this.$('div.map'),
          officers_template:  this.$('#officers_infowindow_template').html(),
          stories_template:   this.$('#client_infowindow_template').html()
        })
        .bind("onHeadClick", function(){
          this._toggleLanding();
        }, this);

        this.$("#background-image").fullscreenBackground();
      },

      _toggleLanding: function(e) {
        if (e) e.preventDefault();
        var state = this.model.get('state');
        this.$('.landing')[state == "landing" ? 'fadeOut' : 'fadeIn' ]();
        this.$('#background-image')[state == "landing" ? 'fadeOut' : 'fadeIn' ]();
        this.model.set('state', state == "landing" ? 'map' : 'landing' );
      }

    });


    cdb.init(function() {
      window.app = new App();
    });

    function getURLParameter(sParam){
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
          return sParameterName[1];
        }
      }
    }

  });
