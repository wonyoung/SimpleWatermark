package com.simplewatermark;

import android.os.Environment;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;

import android.net.Uri;
import android.app.Activity;
import android.content.ContentResolver;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileOutputStream;
import java.lang.String;

public class WatermarkerModule extends ReactContextBaseJavaModule {

  public WatermarkerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "Watermarker";
  }

  @ReactMethod
  public void make(final ReadableMap options, final Promise promise) {
    final ReadableArray images = options.getArray("images");
    final String watermark = options.getString("watermark");
    final ReadableMap transform = options.getMap("transform");
    final String savePath = options.getString("savePath");

    final float scale = (float) transform.getDouble("scale");
    final float alpha = (float) transform.getDouble("opacity");
    final int angle = (int) transform.getDouble("angle");
    final float xPadding = (float) transform.getDouble("xPadding");
    final float yPadding = (float) transform.getDouble("yPadding");

    final String path = getImagePathOrCreate(savePath);

    Thread t = new Thread() {
      @Override
      public void run() {
        for (int i = 0; i < images.size(); i++) {
          String background = images.getString(i);
          String filename = path + "/" + (new File(background)).getName() + ".jpg";
          flattenImage(filename, background, watermark, scale, alpha, angle, xPadding, yPadding);
          WritableMap map = Arguments.createMap();
          map.putDouble("progress", (double)(i+1) / images.size());
          map.putInt("current", i);
          map.putInt("total", images.size());
          sendEvent(getReactApplicationContext(), "watermarkprogress", map);
        }
        WritableMap response = Arguments.createMap();
        promise.resolve(response);
      }
    };
    t.start();
  }

  private String getImagePathOrCreate(final String dirname) {
    final String base = Environment.getExternalStoragePublicDirectory(
        Environment.DIRECTORY_PICTURES).getPath();
    final String pathname = base + "/" + dirname;
    File imagePath = new File(pathname);
    if (imagePath.exists()) {
      return pathname;
    }

    if (imagePath.mkdirs()) {
      return pathname;
    }

    return base;
  }

  private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

  private void flattenImage(final String filename,
                            final String backgroundImagePath,
                            final String foregroundImagePath,
                            final float scale, final float alpha,
                            final int angle,
                            final float xPadding, final float yPadding) {
    Activity activity = getCurrentActivity();
    ContentResolver cr = activity.getContentResolver();

    InputStream fgis, bgis;
    try {
      fgis = cr.openInputStream(Uri.parse(foregroundImagePath));
      bgis = cr.openInputStream(Uri.parse(backgroundImagePath));
    } catch (FileNotFoundException e) {
      return;
    }

    Bitmap fg = BitmapFactory.decodeStream(fgis);
    Bitmap bg = BitmapFactory.decodeStream(bgis);
    Paint paint = new Paint();
    paint.setAlpha((int)(alpha * 255));

    try {
      fgis.close();
      bgis.close();
      fgis = cr.openInputStream(Uri.parse(foregroundImagePath));
      bgis = cr.openInputStream(Uri.parse(backgroundImagePath));
    } catch (FileNotFoundException e) {
    } catch (IOException e) {
    }
    Matrix bgMatrix = new Matrix();
    Exif exif = Exif.createInstance(bgis);
    int orientation = exif.getOrientation();
    applyOrientation(bgMatrix, orientation, bg);

    int outputWidth, outputHeight;
    if (orientation >= 5) {
      outputWidth = bg.getHeight();
      outputHeight = bg.getWidth();
    }
    else {
      outputWidth = bg.getWidth();
      outputHeight = bg.getHeight();
    }


    Matrix matrix = new Matrix();
    applyOrientation(matrix, Exif.createInstance(fgis).getOrientation(), fg);

    matrix.postRotate(angle, fg.getWidth()/2, fg.getHeight()/2);
    matrix.postScale(scale, scale);

    float scaleWidth = 1.0f * outputWidth/fg.getWidth();
    float scaleHeight = 1.0f * outputHeight/fg.getHeight();
    float minScale = (scaleWidth < scaleHeight) ? scaleWidth:scaleHeight;

    matrix.postScale(minScale, minScale);


    int left = position(xPadding, (int) (fg.getWidth()*scale*minScale), outputWidth);
    int top = position(yPadding, (int) (fg.getHeight()*scale*minScale), outputHeight);

    Bitmap output = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(output);
    canvas.drawBitmap(bg, bgMatrix, null);
    canvas.translate(left, top);
    canvas.drawBitmap(fg, matrix, paint);

    try {
      OutputStream os = new FileOutputStream(filename);
      output.compress(Bitmap.CompressFormat.JPEG, 100, os);
      os.close();

      exif.copyTo(filename);
      contentsUpdate(filename);
    } catch (IOException e) {
        e.printStackTrace();
    }

    bg.recycle();
    fg.recycle();
    output.recycle();
  }

  private void contentsUpdate(final String filename) {
    Intent mediascanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
    mediascanIntent.setData(Uri.fromFile(new File(filename)));
    Activity activity = getCurrentActivity();

    activity.sendBroadcast(mediascanIntent);
  }

  private int position(final float padding, final int s1, final int s2) {
    return (int) (s2*padding - s1/2);
  }

  private Matrix applyOrientation(Matrix m, final int orientation, final Bitmap b) {
    switch(orientation) {
      case 1:
        break;
      case 2:
        m.postScale(-1, 1);
        m.postTranslate(b.getWidth(), 0);
        break;
      case 3:
        m.postRotate(180);
        m.postTranslate(b.getWidth(), b.getHeight());
        break;
      case 4:
        m.postScale(1, -1);
        m.postTranslate(0, b.getHeight());
        break;
      case 5:
        m.postScale(1, -1);
        m.postRotate(90);
        break;
      case 6:
        m.postRotate(90);
        m.postTranslate(b.getHeight(), 0);
        break;
      case 7:
        m.postScale(-1, 1);
        m.postRotate(90);
        m.postTranslate(b.getHeight(), b.getWidth());
        break;
      case 8:
        m.postRotate(270);
        m.postTranslate(b.getHeight(), b.getWidth());
        break;
      default:
        break;
    }
    return m;
  }
}
