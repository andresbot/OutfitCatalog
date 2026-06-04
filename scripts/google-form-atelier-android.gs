const APK_URL = 'https://expo.dev/artifacts/eas/hFhAPFSHte8uvkEKgF2FTW.apk';
const LANDING_URL = 'https://landing-nu-cyan-58.vercel.app';
const EXISTING_FORM_ID = '1JwUe0gfSZ_rHCYkMr02a7oj7h4IZG8KN2vb-9vCu3Lw';
const EXISTING_RESPONSES_SHEET_ID = '1I7t1sAh4rDslymBGDE06XfqgHe0_zPmOnb4m5oCW0ZM';

function createAtelierAndroidFeedbackForm() {
  const form = FormApp.create('ATELIER - Cuentanos como te fue en Android');
  const sheet = SpreadsheetApp.create('ATELIER - Respuestas encuesta Android');

  setupFriendlyAndroidForm(form, sheet);
  logFormLinks(form, sheet);
}

function updateExistingAtelierAndroidFeedbackFormFriendly() {
  const form = FormApp.openById(EXISTING_FORM_ID);
  const sheet = SpreadsheetApp.openById(EXISTING_RESPONSES_SHEET_ID);

  setupFriendlyAndroidForm(form, sheet);
  logFormLinks(form, sheet);
}

function setupFriendlyAndroidForm(form, sheet) {
  resetFormItems(form);

  form.setTitle('ATELIER - Cuentanos como te fue en Android');
  form.setDescription(
    'Hola, gracias por ayudarnos a probar ATELIER.\n\n' +
    'Esta encuesta es corta y es para personas del comun. No necesitas saber de tecnologia. ' +
    'Solo queremos saber si la app se entiende, si carga bien, si te gusto y que mejorarias.\n\n' +
    'Antes de responder, intenta instalar la app, abrirla, mirar ropa, guardar algo que te guste ' +
    'y probar una solicitud de contacto.\n\n' +
    'No escribas contrasenas, datos bancarios ni informacion privada.\n\n' +
    'Archivo de instalacion Android: ' + APK_URL + '\n' +
    'Pagina del proyecto: ' + LANDING_URL
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  form.setAcceptingResponses(true);
  form.setConfirmationMessage('Gracias por ayudarnos a probar ATELIER. Tu opinion nos sirve mucho.');

  try {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  } catch (error) {
    Logger.log('No se cambio la hoja de respuestas porque el formulario ya tenia una vinculada.');
  }

  addWelcomeSection(form);
  addTestSection(form);
  addExperienceSection(form);
  addOpinionSection(form);
}

function resetFormItems(form) {
  const items = form.getItems();
  for (let i = items.length - 1; i >= 0; i--) {
    form.deleteItem(items[i]);
  }
}

function addWelcomeSection(form) {
  form.addSectionHeaderItem()
    .setTitle('1. Antes de empezar')
    .setHelpText('La idea es que respondas con sinceridad. No hay respuestas buenas o malas.');

  form.addMultipleChoiceItem()
    .setTitle('Podemos usar tus respuestas de forma anonima para la entrega academica?')
    .setChoiceValues(['Si', 'No'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('Tu nombre o apodo (opcional)')
    .setHelpText('Si prefieres no escribirlo, puedes dejarlo vacio.')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('Que edad tienes?')
    .setChoiceValues(['Menos de 18', '18 a 24', '25 a 34', '35 a 44', '45 o mas', 'Prefiero no decir'])
    .setRequired(true);
}

function addTestSection(form) {
  form.addPageBreakItem()
    .setTitle('2. Que alcanzaste a probar?')
    .setHelpText('Marca solo lo que lograste hacer en la app.');

  form.addMultipleChoiceItem()
    .setTitle('Donde probaste ATELIER?')
    .setChoiceValues(['En mi celular Android', 'En una tablet Android', 'En un celular prestado', 'En un emulador'])
    .showOtherOption(true)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Durante la prueba pude...')
    .setChoiceValues([
      'Instalar la app',
      'Abrir la app',
      'Crear una cuenta o entrar con una cuenta',
      'Mirar prendas en el catalogo',
      'Abrir una prenda para ver mas informacion',
      'Guardar una prenda como favorita',
      'Ver o crear un look',
      'Enviar una solicitud o contactar a un vendedor'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Si algo no te funciono, cuentanos brevemente que paso')
    .setHelpText('Ejemplo: no pude entrar, no cargo una foto, no encontre un boton, etc.')
    .setRequired(false);
}

function addExperienceSection(form) {
  form.addPageBreakItem()
    .setTitle('3. Como se sintio usarla?')
    .setHelpText('Califica de 1 a 5. 1 significa muy mal y 5 significa muy bien.');

  addScale(form, 'Entendi rapidamente de que trata ATELIER.', 'No entendi', 'Entendi muy bien');
  addScale(form, 'Fue facil crear cuenta o entrar.', 'Muy dificil', 'Muy facil');
  addScale(form, 'Fue facil mirar prendas, favoritos o looks.', 'Muy dificil', 'Muy facil');
  addScale(form, 'El diseno de la app me parecio agradable.', 'No me gusto', 'Me gusto mucho');
  addScale(form, 'La app cargo y funciono bien.', 'Muy mal', 'Muy bien');
}

function addOpinionSection(form) {
  form.addPageBreakItem()
    .setTitle('4. Tu opinion final')
    .setHelpText('Con tus respuestas sabremos que mejorar.');

  form.addMultipleChoiceItem()
    .setTitle('Te paso alguno de estos problemas?')
    .setChoiceValues([
      'No, todo funciono bien',
      'La app se cerro',
      'La app se quedo cargando',
      'Algunas fotos no aparecieron',
      'Un boton no respondio',
      'No pude entrar a mi cuenta',
      'No estoy seguro'
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Que fue lo que mas te gusto?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Que cambiarias o mejorarias?')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Se la recomendarias a otra persona?')
    .setChoiceValues(['Si', 'Tal vez', 'No'])
    .setRequired(true);

  addScale(form, 'Que nota general le das a ATELIER?', 'Muy mala', 'Excelente');

  form.addParagraphTextItem()
    .setTitle('Evidencia opcional')
    .setHelpText('Si tienes una captura o video, pega aqui el enlace. Si no tienes, puedes dejarlo vacio.')
    .setRequired(false);
}

function addScale(form, title, lowLabel, highLabel) {
  form.addScaleItem()
    .setTitle(title)
    .setBounds(1, 5)
    .setLabels(lowLabel, highLabel)
    .setRequired(true);
}

function logFormLinks(form, sheet) {
  Logger.log('Formulario listo.');
  Logger.log('URL para editar: ' + form.getEditUrl());
  Logger.log('URL para responder: ' + form.getPublishedUrl());
  Logger.log('Hoja de respuestas: ' + sheet.getUrl());
}
