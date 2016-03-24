package com.simplewatermark;

import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipData.Item;
import android.content.ContentResolver;
import android.content.ActivityNotFoundException;
import android.graphics.Bitmap;
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
import java.io.FilenameFilter;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.String;

public class ImagePickerModule extends ReactContextBaseJavaModule
                               implements ActivityEventListener {
  private static final int REQUEST_PICK_IMAGE = 10;
  private static final int REQUEST_COPY_IMAGE = 20;
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
    getImageIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, multiple);

    final Intent chooserIntent = Intent.createChooser(getImageIntent, "Pick an image");
    try {
      currentActivity.startActivityForResult(chooserIntent, REQUEST_PICK_IMAGE);
    } catch(ActivityNotFoundException e) {
      mPickerPromise.reject(E_FAILED_TO_SHOW_PICKER, e);
      mPickerPromise = null;
    }
  }

  @ReactMethod
  public void copy(final Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity does not exists");
      return;
    }

    mPickerPromise = promise;

    final Intent getImageIntent = new Intent(Intent.ACTION_GET_CONTENT);
    getImageIntent.setType("image/*");
    getImageIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);

    final Intent chooserIntent = Intent.createChooser(getImageIntent, "Pick an image");
    try {
      currentActivity.startActivityForResult(chooserIntent, REQUEST_COPY_IMAGE);
    } catch(ActivityNotFoundException e) {
      mPickerPromise.reject(E_FAILED_TO_SHOW_PICKER, e);
      mPickerPromise = null;
    }
  }

  @Override
  public void onActivityResult(final int requestCode, final int resultCode, final Intent intent) {
    if (requestCode == REQUEST_PICK_IMAGE) {
      if (mPickerPromise == null) {
        return;
      }
      if (resultCode == Activity.RESULT_CANCELED) {
        mPickerPromise.reject(E_PICKER_CANCELLED, "Image picker was cancelled");
      }
      else if (resultCode == Activity.RESULT_OK) {
        pickImage(intent);
      }
      mPickerPromise = null;
    }
    else if (requestCode == REQUEST_COPY_IMAGE) {
      if (mPickerPromise == null) {
        return;
      }
      if (resultCode == Activity.RESULT_CANCELED) {
        mPickerPromise.reject(E_PICKER_CANCELLED, "Image picker was cancelled");
      }
      else if (resultCode == Activity.RESULT_OK) {
        copyImage(intent);
      }
      mPickerPromise = null;
    }
  }

  private void copyImage(final Intent intent) {
    Uri uri = intent.getData();
    if (uri != null) {
      WritableMap image = getImageFrom(uri, true);
      if (image != null) {
        mPickerPromise.resolve(image);
        return;
      }
    }

    mPickerPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
  }

  private void pickImage(final Intent intent) {
    WritableArray images = Arguments.createArray();
    ClipData clip = intent.getClipData();
    if (clip != null) {
      for (int i = 0; i < clip.getItemCount(); i++) {
        Uri uri = clip.getItemAt(i).getUri();
        WritableMap image = getImageFrom(uri, false);
        if (image != null) {
          images.pushMap(image);
        }
      }
    }
    else {
      Uri uri = intent.getData();
      if (uri != null){
        WritableMap image = getImageFrom(uri, false);
        if (image != null) {
          images.pushMap(image);
        }
      }
    }

    if (images.size() > 0) {
      mPickerPromise.resolve(images);
    }
    else {
      mPickerPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
    }
  }

  private WritableMap getImageFrom(final Uri uri, final Boolean copy) {
    WritableMap image = Arguments.createMap();
    Activity activity = getCurrentActivity();
    ContentResolver contentResolver = activity.getContentResolver();
    InputStream is;
    int orientation = 0;
    try {
      is = contentResolver.openInputStream(uri);
    } catch (FileNotFoundException e) {
      android.util.Log.d("Simplewatermark", e.toString());
      return null;
    }

    BitmapFactory.Options k = new BitmapFactory.Options();
    if (copy) {
      Bitmap bitmap = BitmapFactory.decodeStream(is, null, k);
      deleteCopiedFiles();
      Uri u = writeFile(bitmap);
      image.putString("uri", u.toString());
    }
    else {
      k.inJustDecodeBounds = true;
      BitmapFactory.decodeStream(is, null, k);
      image.putString("uri", uri.toString());
    }
    image.putInt("width", k.outWidth);
    image.putInt("height", k.outHeight);

    try {
      is.close();
      is = contentResolver.openInputStream(uri);
      orientation = Exif.createInstance(is).getOrientation();
    } catch (FileNotFoundException e) {
    } catch (IOException e) {
    }

    image.putInt("orientation", orientation);

    return image;
  }

  private void deleteCopiedFiles() {
    Activity context = getCurrentActivity();
    File filesdir = context.getFilesDir();
    for (File file : filesdir.listFiles(new FilenameFilter() {
      @Override
      public boolean accept(File dir, String filename) {
        return filename.startsWith("watermark") && filename.endsWith(".png");
      }
    })) {
      file.delete();
    }
  }

  private Uri writeFile(final Bitmap bitmap) {
    Activity context = getCurrentActivity();
    try {
      File output = File.createTempFile("watermark", ".png", context.getFilesDir());
      OutputStream out = null;
      try {
        out = new BufferedOutputStream(new FileOutputStream(output));
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
      } finally {
        if (out != null) {
          try {
            out.close();
          } catch (IOException e) {
          }
        }
      }
      return Uri.fromFile(output);
    } catch (FileNotFoundException e) {
      return null;
    } catch (IOException e) {
      return null;
    }
  }
}
