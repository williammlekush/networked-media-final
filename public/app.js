const app = {

   contentTypes: {
      LTR: "letter",
      LTRIMG: "letter-images",
      VID: "video"
   },

   headerElems: {
      HEADER: ".header-gallery",
      BTNS: {
         BACK: ".btn-back",
         INPUT: ".btn-input",
         HBDAY: ".btn-hbday"
      }
   },
   
   templates: {
      landing: "#landing",
      letter: "#letter",
      letterImages: "#letter-images",
      video: "#video",
      closing: "#closing",
      gallery: "#gallery",
   },

   btns: {
      NEXT: ".btn-next",
      LOGIN: ".btn-login",
      GALLERY: ".btn-gallery",
   },

   forms: {
      login: ".form-login",
   },

   contentKeys: [],

   openingIndex: 0,

   init: function() {  
      app.hideAllTemplates();    
      $.each([app.btns.NEXT, app.headerElems.HEADER], (index, elem) => $(elem).hide());
      app.landingPage();
   },

   landingPage: async function() {
      $(app.templates.landing).show();

      $(app.btns.LOGIN).click(
         async () => {
            app.contentKeys = await app.getContentKeys();
            app.enableBtns();
            app.transitionOpening();
         });
   },

   transitionOpening: function() {
      if (app.openingIndex < app.contentKeys.length) {
         if (app.openingIndex === 0) {            
            $(app.btns.NEXT).show();
         }

         app.transitionContentTemplate(app.contentKeys[app.openingIndex]);

         app.openingIndex += 1;
      } else {
         $(app.btns.NEXT).hide();
         app.closing();
      }
   },

   transitionContentTemplate: async function(contentKey) {
      const contentParams = await app.getContentParams(contentKey);

      app.clearContent();

      await app.fillContentTemplate(contentParams);

      app.hideAllTemplates();

      app.showContentTemplate(contentParams.type);      
   },

   closing: function() {
      app.hideAllTemplates();
      
      $(app.templates.closing).show();
   },

   transitionGallery: function() {
      app.hideAllTemplates();
      app.clearContent();

      app.contentKeys.forEach(
         async key => {
            app.fillGallery(Object.assign({ linkKey: key }, await this.getGalleryParams(key)));
         }
      )

      $(app.templates.gallery).show();
      $(app.headerElems.HEADER).show();
      $(app.headerElems.BTNS.BACK).hide();
   },

   clearContent: function() {
      $(".content > *").remove()
   },

   fillGallery: async function({ linkKey, thumbnailPath, captionPath }) {
      const caption = await app.getText(captionPath);
      const gallery = ".content-gallery";
      
      $("<img>")
      .attr({ src: thumbnailPath, alt: "" })
      .appendTo(gallery)
      .click(() => {
         app.transitionContentTemplate(linkKey);
         
         $(app.headerElems.BTNS.BACK).show()
      });

      $("<p></p>").text(caption).appendTo(gallery)
   },

   showContentTemplate: function(showType) {
      const contentType = showType;

      switch(contentType) {
         case app.contentTypes.LTR:
            $(app.templates.letter).show();
            break;
         case app.contentTypes.LTRIMG:
            $(app.templates.letterImages).show();
            break;
         case app.contentTypes.VID:
            $(app.templates.video).show();
            break;
      }
   },

   fillContentTemplate: async function(fillParams) {
      const contentType = fillParams.type;

      const fill = {
         contentElem: `.content-${contentType}`,
         templateParams: fillParams
      }

      switch(contentType) {
         case app.contentTypes.LTR:
            await app.fillLetterTemplate(fill);
            break;
         case app.contentTypes.LTRIMG:
            await app.fillLetterImagesTemplate(fill);
            break;
         case app.contentTypes.VID:
            await app.fillVideoTemplate(fill);
            break;
      }
   },

   fillLetterTemplate: async function({ contentElem, templateParams }) {
      await app.fillLetterText({ textElem: contentElem, textPath: templateParams.text });
   },

   fillLetterImagesTemplate: async function({ contentElem, templateParams }) {
      await app.fillLetterText({ textElem: contentElem, textPath: templateParams.text });

      templateParams.imgs.forEach(
         imgPath => {
            $( "<img>").attr({
               src: imgPath,
               alt: ""
            }).appendTo(contentElem);
         });
   },

   fillVideoTemplate: async function({ contentElem, templateParams }) {
      const caption = await app.getText(templateParams.text);

      $("<iframe></iframe>").attr({
         class: "video",
         src: templateParams.vid,
         frameborder: "0",
         allow: "autoplay; fullscreen",
         allowfullscreen: "",
      }).appendTo(contentElem);

      $("<p></p>").text(caption).appendTo(contentElem);
   },

   fillLetterText: async function({ textElem, textPath} ) {
      const text = await app.getText(textPath);
      
      $("<p></p>").text(text).appendTo(textElem);
   },

   getText: async function(filePath) {
      return await $.get(filePath, "text");
   },

   getContentKeys: async function() {
      return await $.get("/keys");
   },

   getContentParams: async function(contentKey) {
      return await $.get("/content", { key: contentKey });
   },

   getGalleryParams: async function(galleryKey) {
      return await $.get("/gallery", { key: galleryKey })
   },

   hideAllTemplates: function() {
      $.each(app.templates, (key, value) => $(value).hide());
   },

   enableBtns: function() {
      $(app.btns.NEXT).click(() => app.transitionOpening());
      $(app.btns.GALLERY).click(() => app.transitionGallery());

      $(app.headerElems.BTNS.INPUT).click(() => $(".msg-input").show());
      $(app.headerElems.BTNS.BACK).click(() => app.transitionGallery());

      $(app.headerElems.BTNS.HBDAY).click(() => {
         $(app.headerElems.HEADER).hide();
         app.openingIndex = 0;
         app.clearContent();
         app.transitionOpening();
      });
   }
}

$(() => app.init())