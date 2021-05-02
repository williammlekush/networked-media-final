const app = {

   templates: {
      landing: $("#landing"),
   },

   init: function() {
      console.log("hi");
      app.templates.landing.hide();
      console.log(pages.landing);
   }
}

jQuery(
   () => {
      app.init();
   }
)