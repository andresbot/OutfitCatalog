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
    'Esta encuesta es para personas del comun. No necesitas saber de tecnologia ni programacion. ' +
    'Solo queremos conocer tu experiencia usando la app en un celular Android: si se entiende, si te gusto, ' +
    'si cargo bien y que cambiarias.\n\n' +
    'Antes de responder, intenta instalar la app, abrirla, mirar ropa, guardar algo que te guste y probar una solicitud de contacto.\n\n' +
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
  addPhoneSection(form);
  addActionsSection(form);
  addExperienceSection(form);
  addLoadingSection(form);
  addInternetSection(form);
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

  form.addMultipleChoiceItem()
    .setTitle('Sueles usar apps para mirar ropa, comprar o buscar productos?')
    .setChoiceValues(['Si, mucho', 'A veces', 'Casi nunca', 'Nunca'])
    .setRequired(true);
}

function addPhoneSection(form) {
  form.addPageBreakItem()
    .setTitle('2. Celular donde probaste la app')
    .setHelpText('Esta prueba es solo para Android.');

  form.addMultipleChoiceItem()
    .setTitle('Donde probaste ATELIER?')
    .setChoiceValues(['En mi celular Android', 'En una tablet Android', 'En un celular prestado', 'En un emulador'])
    .showOtherOption(true)
    .setRequired(true);

  form.addTextItem()
    .setTitle('Si sabes, escribe la marca o modelo del celular')
    .setHelpText('Ejemplo: Samsung, Xiaomi, Motorola, Pixel. Si no sabes, escribe "No se".')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('Que tan facil fue instalar la app?')
    .setChoiceValues(['Muy facil', 'Facil', 'Normal', 'Dificil', 'No pude instalarla'])
    .setRequired(true);
}

function addActionsSection(form) {
  form.addPageBreakItem()
    .setTitle('3. Que alcanzaste a probar?')
    .setHelpText('Marca solo lo que lograste hacer en la app.');

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
      'Enviar una solicitud o contactar a un vendedor',
      'Cerrar y volver a abrir la app'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Si algo no te funciono, cuentanos que paso')
    .setHelpText('Ejemplo: no pude entrar, no cargo una foto, no encontre un boton, etc.')
    .setRequired(false);
}

function addExperienceSection(form) {
  form.addPageBreakItem()
    .setTitle('4. Como se sintio usarla?')
    .setHelpText('Califica de 1 a 5. 1 significa muy mal y 5 significa muy bien.');

  addScale(form, 'Entendi rapidamente de que trata ATELIER.', 'No entendi', 'Entendi muy bien');
  addScale(form, 'Fue facil crear cuenta o entrar.', 'Muy dificil', 'Muy facil');
  addScale(form, 'Fue facil mirar las prendas.', 'Muy dificil', 'Muy facil');
  addScale(form, 'Los botones se entendian.', 'Nada claros', 'Muy claros');
  addScale(form, 'El texto se leia bien.', 'Se leia mal', 'Se leia muy bien');
  addScale(form, 'El diseno de la app me parecio agradable.', 'No me gusto', 'Me gusto mucho');
  addScale(form, 'Entendi como guardar favoritos, ver looks o pedir informacion.', 'No entendi', 'Entendi muy bien');
}

function addLoadingSection(form) {
  form.addPageBreakItem()
    .setTitle('5. Rapidez y funcionamiento')
    .setHelpText('Responde segun lo que viste mientras usabas la app.');

  addScale(form, 'La app abrio rapido.', 'Muy lenta', 'Muy rapida');
  addScale(form, 'Las fotos de la ropa cargaron bien.', 'Cargaron mal', 'Cargaron bien');
  addScale(form, 'Moverme por el catalogo se sintio comodo.', 'Se trababa mucho', 'Muy comodo');
  addScale(form, 'La app funciono sin cerrarse sola.', 'Se cerro o fallo', 'Funciono bien');

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
    .setTitle('Si tuviste un problema, en que parte paso?')
    .setHelpText('Puedes escribir algo corto, por ejemplo: "en el registro", "en el catalogo", "al enviar solicitud".')
    .setRequired(false);
}

function addInternetSection(form) {
  form.addPageBreakItem()
    .setTitle('6. Internet')
    .setHelpText('Esto nos ayuda a saber si la app se comporta bien con distintas conexiones.');

  form.addMultipleChoiceItem()
    .setTitle('Que conexion usaste para probarla?')
    .setChoiceValues(['WiFi', 'Datos del celular', 'Mala senal', 'Use WiFi y datos', 'No se'])
    .showOtherOption(true)
    .setRequired(true);

  addScale(form, 'Con esa conexion, la app se dejo usar bien.', 'Muy mal', 'Muy bien');

  form.addMultipleChoiceItem()
    .setTitle('Que fue lo que mas se demoro en cargar?')
    .setChoiceValues(['Nada, todo cargo bien', 'Abrir la app', 'Las fotos', 'El catalogo', 'Crear cuenta o entrar', 'Enviar una solicitud', 'No se'])
    .showOtherOption(true)
    .setRequired(true);
}

function addOpinionSection(form) {
  form.addPageBreakItem()
    .setTitle('7. Tu opinion final')
    .setHelpText('Con tus respuestas sabremos que mejorar.');

  form.addParagraphTextItem()
    .setTitle('Que fue lo que mas te gusto de la app?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Que fue lo mas dificil o confuso?')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Que cambiarias o mejorarias?')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Usarias una app asi para mirar ropa o pedir informacion a vendedores?')
    .setChoiceValues(['Si', 'Tal vez', 'No'])
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
