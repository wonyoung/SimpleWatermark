package com.simplewatermark;

import android.os.Environment;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.FileOutputStream;

public class WatermarkerModule extends ReactContextBaseJavaModule {

  public WatermarkerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "Watermarker";
  }

  @ReactMethod
  public void make(final ReadableMap options, final Callback callback) {
    ReadableArray backgrounds = options.getArray("backgroundPaths");
    String watermark = options.getString("watermarkPath");
    float scale = (float) options.getDouble("scale");
    float alpha = (float) options.getDouble("alpha");
    int angle = options.getInt("angle");
    int left = options.getInt("left");
    int top = options.getInt("top");

    String path = Environment.getExternalStoragePublicDirectory(
        Environment.DIRECTORY_PICTURES).getPath();

    for (int i = 0; i < backgrounds.size(); i++) {
      String background = backgrounds.getString(i);
      String filename = path + "/" + (new File(background)).getName() + ".jpg";
      flattenImage(filename, background, watermark, scale, alpha, angle, left, top);
      WritableMap response = Arguments.createMap();
      response.putInt("index", i);
      response.putString("path", filename);
      callback.invoke(response);
    }
  }

  private void flattenImage(final String filename, final String backgroundImagePath, final String foregroundImagePath,
    final float scale, final float alpha, final int angle, final int left, final int top) {
    Bitmap bg = BitmapFactory.decodeFile(backgroundImagePath);
    Bitmap fg = BitmapFactory.decodeFile(foregroundImagePath);
    Paint paint = new Paint();
    paint.setAlpha((int)(alpha * 255));

    Matrix matrix = new Matrix();
    matrix.postRotate(angle, fg.getWidth()/2, fg.getHeight()/2);
    matrix.postScale(scale, scale);

    Bitmap output = bg.copy(Bitmap.Config.ARGB_8888, true);
    Canvas canvas = new Canvas(output);
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
}
