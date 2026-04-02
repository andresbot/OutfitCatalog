import 'package:flutter_test/flutter_test.dart';

import 'package:outfit_catalog/app.dart';

void main() {
  testWidgets('App se renderiza correctamente', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const App());

    // Verificar que la app muestra el texto inicial.
    expect(find.text('Outfit Catalog — Clean Architecture'), findsOneWidget);
  });
}
