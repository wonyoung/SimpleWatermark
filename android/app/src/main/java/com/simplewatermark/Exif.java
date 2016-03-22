package com.simplewatermark;

import org.apache.sanselan.Sanselan;
import org.apache.sanselan.ImageReadException;
import org.apache.sanselan.common.IImageMetadata;
import org.apache.sanselan.formats.jpeg.JpegImageMetadata;
import org.apache.sanselan.formats.tiff.TiffField;
import org.apache.sanselan.formats.tiff.constants.ExifTagConstants;
import org.apache.sanselan.formats.tiff.TiffImageData;
import org.apache.sanselan.formats.tiff.JpegImageData;

import org.apache.sanselan.formats.tiff.TiffImageMetadata;
import org.apache.sanselan.formats.jpeg.exifRewrite.ExifRewriter;
import org.apache.sanselan.formats.tiff.write.TiffOutputSet;
import org.apache.sanselan.formats.tiff.write.TiffOutputDirectory;
import org.apache.sanselan.ImageWriteException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;

import java.io.InputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class Exif {
  final JpegImageMetadata metadata;

  private Exif(JpegImageMetadata metadata) {
    super();
    this.metadata = metadata;
  }

  public static Exif createInstance(final InputStream is) {
    JpegImageMetadata jpegMetadata = null;
    try {
      IImageMetadata metadata = Sanselan.getMetadata(is, null);
      is.close();
      if (metadata instanceof JpegImageMetadata) {
        jpegMetadata = (JpegImageMetadata) metadata;
      }
    } catch (ImageReadException e) {
    } catch (IOException e) {
    }
    return new Exif(jpegMetadata);
  }

  public int getOrientation() {
    int orientation = 0;

    if (metadata == null) {
      return 0;
    }

    TiffField field = metadata.findEXIFValue(ExifTagConstants.EXIF_TAG_ORIENTATION);
    if (field == null) {
      return 0;
    }

    try {
      orientation = field.getIntValue();
    } catch (ImageReadException e) {
    }

    return orientation;
  }

  private TiffOutputSet getExif() {
    if (metadata == null) {
      return new TiffOutputSet();
    }

    final TiffImageMetadata exif = metadata.getExif();
    if (exif == null) {
      return new TiffOutputSet();
    }

    TiffOutputSet outputSet;

    try {
      outputSet = exif.getOutputSet();
      outputSet.removeField(ExifTagConstants.EXIF_TAG_ORIENTATION);

      for (Object obj : outputSet.getDirectories()) {
        TiffOutputDirectory directory = (TiffOutputDirectory) obj;
        JpegImageData jpeg = directory.getRawJpegImageData();
        if (jpeg != null) {
          directory.setJpegImageData(null);
        }

        TiffImageData tiff = directory.getRawTiffImageData();
        if (tiff != null) {
          directory.setTiffImageData(null);
        }
      }
    } catch (ImageWriteException e) {
      return new TiffOutputSet();
    }

    return outputSet;
  }

  public void copyTo(final String filename) {
    final String from = filename;
    final String to = from+".exif";
    TiffOutputSet outputSet = getExif();
    File f;
    FileOutputStream fos;

    try {
      f = new File(from);
      fos = new FileOutputStream(to);
    } catch (FileNotFoundException e) {
      return;
    }

    BufferedOutputStream bos = new BufferedOutputStream(fos);
    try {
      new ExifRewriter().updateExifMetadataLossless(f, bos, outputSet);

      f.delete();
      bos.close();
      File file = new File(to);
      file.renameTo(f);
    } catch (ImageReadException e) {
    } catch (ImageWriteException e) {
    } catch (IOException e) {
    }
  }
}
