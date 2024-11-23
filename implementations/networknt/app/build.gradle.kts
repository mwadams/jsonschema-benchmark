plugins {
    // Apply the application plugin to add support for building a CLI application in Java.
    application
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

dependencies {
    // This dependency is used by the application.
    implementation(libs.graalJs)
    implementation(libs.networknt)
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    // Define the main class for the application.
    mainClass = "io.github.sourcemeta.App"
}
//
// See https://stackoverflow.com/a/38528497/123695
fun ConfigurationContainer.resolveAll() = this
  .filter { it.isCanBeResolved }
  .forEach { it.resolve() }

tasks.register("downloadDependencies") {
  doLast {
    configurations.resolveAll()
    buildscript.configurations.resolveAll()
  }
}
