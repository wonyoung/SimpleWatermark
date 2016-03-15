package com.simplewatermark;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Metadata;
import com.drew.metadata.MetadataException;
import com.drew.metadata.Directory;
import com.drew.metadata.exif.ExifDirectoryBase;
import com.drew.metadata.exif.ExifIFD0Directory;

import java.io.InputStream;
import java.io.BufferedInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class Exif {
  public static int getOrientation(final InputStream is) {
    int orientation = 0;
    BufferedInputStream bis = new BufferedInputStream(is);
    try {
      Metadata metadata = ImageMetadataReader.readMetadata(bis);
      Directory exifDirectory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
      if (exifDirectory != null) {
        orientation = exifDirectory.getInt(ExifDirectoryBase.TAG_ORIENTATION);
      }
    } catch (ImageProcessingException e) {
    } catch (IOException e) {
    } catch (MetadataException e) {
    } finally {
      try {
        bis.close();
      } catch (IOException e) {
      }
    }

    return orientation;
  }
}
