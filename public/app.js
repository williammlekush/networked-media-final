const app = {

   contentTypes: {
      LTR: "letter",
      LTRIMG: "letter-images",
      VID: "video"
   },

   elems: {
      HEADER: {
         HEADER: ".header-gallery",
         BTNS: {
            BACK: ".btn-back",
            INPUT: ".btn-input",
            HBDAY: ".btn-hbday"
         },
      },
      TEMPLATES: {
         LANDING: "#landing",
         CLOSING: "#closing",
         GALLERY: "#gallery",
         LTR: "#letter",
         LTRIMGS: "#letter-images",
         VID: "#video",
      },
      BTNS: {
         NEXT: ".btn-next",
         LOGIN: ".btn-login",
         GALLERY: ".btn-gallery",
      },
      FORMS: {
         LOGIN: ".form-login"
      }
   },

   contentKeys: [],

   openingIndex: 0,

   init: function() {  
      app.hideAllTemplates();    
      $.each([app.elems.BTNS.NEXT, app.elems.HEADER.HEADER], (index, elem) => $(elem).hide());
      app.landingPage();
   },

   landingPage: async function() {
      $(app.elems.TEMPLATES.LANDING).show();

      $(app.elems.BTNS.LOGIN).click(
         async () => {
            app.contentKeys = await app.getContentKeys();
            app.enableBtns();
            app.transitionOpening();
         });
   },

   transitionOpening: function() {
      if (app.openingIndex < app.contentKeys.length) {
         if (app.openingIndex === 0) {            
            $(app.elems.BTNS.NEXT).show();
         }

         app.transitionContentTemplate(app.contentKeys[app.openingIndex]);

         app.openingIndex += 1;
      } else {
         $(app.elems.BTNS.NEXT).hide();
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
      
      $(app.elems.TEMPLATES.CLOSING).show();
   },

   transitionGallery: function() {
      app.hideAllTemplates();
      app.clearContent();

      app.contentKeys.forEach(
         async key => {
            app.fillGallery(Object.assign({ linkKey: key }, await this.getGalleryParams(key)));
         }
      )

      $(app.elems.TEMPLATES.GALLERY).show();
      $(app.elems.HEADER.HEADER).show();
      $(app.elems.HEADER.BTNS.BACK).hide();
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
         
         $(app.elems.HEADER.BTNS.BACK).show()
      });

      $("<p></p>").text(caption).appendTo(gallery)
   },

   showContentTemplate: function(showType) {
      const contentType = showType;

      switch(contentType) {
         case app.contentTypes.LTR:
            $(app.elems.TEMPLATES.LTR).show();
            break;
         case app.contentTypes.LTRIMG:
            $(app.elems.TEMPLATES.LTRIMGS).show();
            break;
         case app.contentTypes.VID:
            $(app.elems.TEMPLATES.VID).show();
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
      $.each(app.elems.TEMPLATES, (key, value) => $(value).hide());
   },

   enableBtns: function() {
      $(app.elems.BTNS.NEXT).click(() => app.transitionOpening());
      $(app.elems.BTNS.GALLERY).click(() => app.transitionGallery());

      $(app.elems.HEADER.BTNS.INPUT).click(() => $(".msg-input").show());
      $(app.elems.HEADER.BTNS.BACK).click(() => app.transitionGallery());

      $(app.elems.HEADER.BTNS.HBDAY).click(() => {
         $(app.elems.HEADER.HEADER).hide();
         app.openingIndex = 0;
         app.clearContent();
         app.transitionOpening();
      });
   }
}

$(() => app.init())