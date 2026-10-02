import 'package:apgo_design/apgo_tokens.dart';
import 'package:flutter/material.dart';

class ApgoApp extends StatelessWidget {
  const ApgoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'APGO',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: ApgoColors.primary,
          primary: ApgoColors.primary,
          secondary: ApgoColors.accent,
          surface: ApgoColors.background,
        ),
        fontFamily: ApgoFonts.body,
      ),
      home: const Scaffold(
        body: Center(child: Text('APGO')),
      ),
    );
  }
}
