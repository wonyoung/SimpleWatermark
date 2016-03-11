package com.simplewatermark;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;

import java.lang.String;

public class ImagePickerModule extends ReactContextBaseJavaModule
                               implements ActivityEventListener {
  private static final int REQUEST_PICK_IMAGE = 10;
  private static final String E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST";
  private static final String E_FAILED_TO_SHOW_PICKER = "E_FAILED_TO_SHOW_PICKER";
  private static final String E_PICKER_CANCELLED = "E_PICKER_CANCELLED";
  private static final String E_NO_IMAGE_DATA_FOUND = "E_NO_IMAGE_DATA_FOUND";

  private Promise mPickerPromise;

  public ImagePickerModule(ReactApplicationContext reactContext) {
    super(reactContext);

    reactContext.addActivityEventListener(this);
  }

  @Override
  public String getName() {
    return "ImagePicker";
  }

  @ReactMethod
  public void launch(final Boolean multiple, final Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity does not exists");
      return;
    }

    mPickerPromise = promise;

    final Intent getImageIntent = new Intent(Intent.ACTION_GET_CONTENT);
    getImageIntent.setType("image/*");
    getImageIntent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
    getImageIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);

    final Intent chooserIntent = Intent.createChooser(getImageIntent, "Pick an image");
    try {
      currentActivity.startActivityForResult(chooserIntent, REQUEST_PICK_IMAGE);
    } catch(ActivityNotFoundException e) {
      mPickerPromise.reject(E_FAILED_TO_SHOW_PICKER, e);
      mPickerPromise = null;
    }
  }

  @Override
  public void onActivityResult(final int requestCode, final int resultCode, final Intent intent) {
    if (requestCode != REQUEST_PICK_IMAGE) {
      return;
    }

    if (mPickerPromise == null) {
      return;
    }

    if (resultCode == Activity.RESULT_CANCELED) {
      mPickerPromise.reject(E_PICKER_CANCELLED, "Image picker was cancelled");
    }
    else if (resultCode == Activity.RESULT_OK) {
      Uri uri = intent.getData();

      if (uri == null) {
        mPickerPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
      }
      else {
        mPickerPromise.resolve(uri.toString());
      }
    }
    mPickerPromise = null;
  }
}
