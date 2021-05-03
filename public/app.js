const app = {

   templates: {
      landing: "#landing",
      letter: "#letter",
      letterPhotos: "#letter-photos",
      video: "#video",
      closing: "#closing",
      gallery: "#gallery",
   },

   btns: {
      next: ".btn-next",
   },

   forms: {
      login: ".form-login",
   },

   init: function() {      
      $.each(app.templates, (key, value) => $(value).hide());
      app.landingPage();
   },

   landingPage: function() {
      $(templates.landing).show();
      $(forms.locgin).submit(() => {app.content()});
   },

   getContent: function(contentKey, getAll = false) {
      $.get("/content", { key: contentKey, all: getAll })
      .done(data => console.log(data));
   }
}

$(() => app.init())