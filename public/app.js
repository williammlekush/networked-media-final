
const app = {

   msgs: {
      LANDING: {
         HEADER: "Happy Birthday Sunhi!",
         COPY: `You gave me the best birthday present I could have asked for this year,
          and I've been trying to figure out how to one up you ever since. I know, I know,
         "Not everything is a competition, Will", but you deserve my best, everyday. So
         here it goes. From us, to you.`
      }
   },

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
         LANDING: {
            SECTION: "#landing",
            HEADER: "#msg-hbday",
            COPY: ".copy-landing"
         },
         LOGIN: "#login",
         CLOSING: "#closing",
         GALLERY: "#gallery",
         LTR: "#letter",
         LTRIMGS: "#letter-images",
         VID: "#video",
      },
      LOGIN: {
         INPUT: ".input-pass",
         BTN: ".btn-login"
      },
      BTNS: {
         NEXT: ".btn-next",
         GALLERY: ".btn-gallery",
      },
      FORMS: {
         LOGIN: ".form-login"
      }
   },

   contentKeys: [],

   openingIndex: 0,

   init: function() {  
      $(app.elems.LOGIN.BTN).click(
         async () => {
            const access = await $.post("/login", {password: $(app.elems.LOGIN.INPUT).val() });

            if (access.success) {
               app.contentKeys = await app.getContentKeys();
               app.enableBtns();

               if (!access.hbday) {
                  app.transitionOpening();
               } else {
                  app.transitionGallery();
               }

            } else {
               $(app.elems.LOGIN.INPUT).val("").attr("placeholder", "I guess not :'( ");
            }
         });
      app.landingPage();
   },

   landingPage: function() {
      $(app.elems.TEMPLATES.LANDING.SECTION).show();

      app.typeWrite(
         {  txt: app.msgs.LANDING.HEADER, 
            target: app.elems.TEMPLATES.LANDING.HEADER,
            speed: 50,
         });
      
      setTimeout(
         () => {
            app.typeWrite(
               {
                  txt: app.msgs.LANDING.COPY,
                  target: app.elems.TEMPLATES.LANDING.COPY,
                  speed: 50,
               });
         }, app.msgs.LANDING.HEADER.length * 50 + 1000);   
   },

   typeWrite: function({ txt, target, speed }) {
      let i = 0;

      const writing = setInterval(
         () => {
            if (i < txt.length) {
               $(target).append(txt.charAt(i));
               i ++;
            } else {
               clearInterval(writing);
            }
         }, speed
      );
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

   closing: async function() {
      app.hideAllTemplates();
      
      $(app.elems.TEMPLATES.CLOSING).show();

      await $.post("/hbday-done");
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