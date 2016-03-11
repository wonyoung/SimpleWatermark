package com.simplewatermark;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.imagepicker.ImagePickerPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;

import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import android.content.Intent;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class MainActivity extends ReactActivity {
    private ImagePickerPackage mImagePickerPackage = null;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "SimpleWatermark";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      mImagePickerPackage = new ImagePickerPackage(this);

      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new ReactMaterialKitPackage(),
        new ReactPackage() {
          @Override
          public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
            return Arrays.<NativeModule>asList(
              new WatermarkerModule(reactContext),
              new ImagePickerModule(reactContext)
            );
          }

          @Override
          public List<Class<? extends JavaScriptModule>> createJSModules() {
            return Collections.emptyList();
          }

          @Override
          public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
            return Collections.emptyList();
          }
        },
        mImagePickerPackage
      );
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
      super.onActivityResult(requestCode, resultCode, data);

      mImagePickerPackage.handleActivityResult(requestCode, resultCode, data);
    }
}
