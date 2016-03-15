package com.simplewatermark;

import android.os.Environment;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;

import android.net.Uri;
import android.app.Activity;
import android.content.ContentResolver;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
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
  private ReactContext context;

  public WatermarkerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.context = reactContext;
  }

  @Override
  public String getName() {
    return "Watermarker";
  }

  @ReactMethod
  public void make(final ReadableMap options, final Callback callback) {
    ReadableArray images = options.getArray("images");
    String watermark = options.getString("watermark");
    float scale = (float) options.getDouble("scale");
    float alpha = (float) options.getDouble("opacity");
    int angle = options.getInt("angle");
    int left = options.getInt("left");
    int top = options.getInt("top");
    int position = options.getInt("position");
    float padding = (float) options.getDouble("padding");

    String path = Environment.getExternalStoragePublicDirectory(
        Environment.DIRECTORY_PICTURES).getPath();

    for (int i = 0; i < images.size(); i++) {
      String background = images.getString(i);
      String filename = path + "/" + (new File(background)).getName() + ".jpg";
      flattenImage(filename, background, watermark, scale, alpha, angle, left, top, position, padding);
      WritableMap map = Arguments.createMap();
      map.putInt("progress", i + 1);
      map.putInt("total", images.size());
      sendEvent(this.context, "watermarkprogress", map);
    }
    WritableMap response = Arguments.createMap();

    callback.invoke(response);
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
                            final int angle, int left, int top,
                            final int position, final float padding) {
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
    int orientation = Exif.getOrientation(bgis);
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
    applyOrientation(matrix, Exif.getOrientation(fgis), fg);

    matrix.postRotate(angle, fg.getWidth()/2, fg.getHeight()/2);
    matrix.postScale(scale, scale);

    float scaleWidth = 1.0f * outputWidth/fg.getWidth();
    float scaleHeight = 1.0f * outputHeight/fg.getHeight();
    float minScale = (scaleWidth < scaleHeight) ? scaleWidth:scaleHeight;

    matrix.postScale(minScale, minScale);

    if (position > 0) {
      left = leftByPosition(position, padding, (int) (fg.getWidth()*scale*minScale), outputWidth);
      top = topByPosition(position, padding, (int) (fg.getHeight()*scale*minScale), outputHeight);
    }

    Bitmap output = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(output);
    canvas.drawBitmap(bg, bgMatrix, null);
    canvas.translate(left, top);
    canvas.drawBitmap(fg, matrix, paint);

    try {
      OutputStream os = new FileOutputStream(filename);
      output.compress(Bitmap.CompressFormat.JPEG, 100, os);
    } catch (IOException e) {
        e.printStackTrace();
    }

    bg.recycle();
    fg.recycle();
    output.recycle();
  }

  private int leftByPosition(final int position, final float padding, final int w1, final int w2) {
    int x = (position - 1) % 3;
    int diff = w2 - w1;
    return diff * x / 2 + (int) ((1-x)*diff*padding);
  }

  private int topByPosition(final int position, final float padding, final int h1, final int h2) {
    int y = (position - 1) / 3;
    int diff = h2 - h1;
    return diff * y / 2 + (int) ((1-y)*diff*padding);
  }

  private Matrix applyOrientation(Matrix m, final int orientation, final Bitmap b) {

// TODO:: check height and width of orientation 5,6,7,8;
    switch(orientation) {
      case 1:
        break;
      case 2:
        m.postScale(-1, 1);
        m.postTranslate(b.getWidth(), 0);
        break;
      case 3:
        m.setRotate(180, b.getWidth()/2, b.getHeight()/2);
        break;
      case 4:
        m.postScale(1, -1);
        m.postTranslate(0, b.getHeight());
        break;
      case 5:
        m.postRotate(90, b.getWidth()/2, b.getHeight()/2);
        m.postScale(-1, 1);
        m.postTranslate(b.getWidth(), 0);
        break;
      case 6:
        m.postRotate(90, b.getWidth()/2, b.getHeight()/2);
        break;
      case 7:
        m.postScale(-1, 1);
        m.postTranslate(b.getWidth(), 0);
        m.postRotate(90, b.getWidth()/2, b.getHeight()/2);
        break;
      case 8:
        m.postRotate(270, b.getWidth()/2, b.getHeight()/2);
        break;
      default:
        break;
    }
    return m;
  }
}
