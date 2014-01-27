
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
