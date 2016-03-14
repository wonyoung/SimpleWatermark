package com.simplewatermark;

import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipData.Item;
import android.content.ActivityNotFoundException;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.InputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
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
      WritableArray images = Arguments.createArray();
      ClipData clip = intent.getClipData();
      if (clip != null) {
        for (int i = 0; i < clip.getItemCount(); i++) {
          Uri uri = clip.getItemAt(i).getUri();
          WritableMap image = getImageFrom(uri);
          if (image != null) {
            images.pushMap(image);
          }
        }
        mPickerPromise.resolve(images);
      }
      else {
        Uri uri = intent.getData();
        if (uri != null){
          WritableMap image = getImageFrom(uri);
          if (image != null) {
            images.pushMap(image);
          }
          mPickerPromise.resolve(images);
        }
        else {
          mPickerPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
        }
      }
    }
    mPickerPromise = null;
  }

  private WritableMap getImageFrom(final Uri uri) {
    WritableMap image = Arguments.createMap();
    Activity activity = getCurrentActivity();
    InputStream is;
    try {
      is = activity.getContentResolver().openInputStream(uri);
    } catch (FileNotFoundException e) {
      return null;
    }

    BitmapFactory.Options k = new BitmapFactory.Options();
    k.inJustDecodeBounds = true;
    BitmapFactory.decodeStream(is, null, k);

    try {
      is.close();
    } catch (IOException e) {
    }

    image.putString("uri", uri.toString());
    image.putInt("width", k.outWidth);
    image.putInt("height", k.outHeight);

    return image;
  }
}
