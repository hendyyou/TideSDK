/**
* This file has been modified from its orginal sources.
*
* Copyright (c) 2012 Software in the Public Interest Inc (SPI)
* Copyright (c) 2012 David Pratt
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
***
* Copyright (c) 2008-2012 Appcelerator Inc.
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

describe("Ti.Filesystem FileStream tests", {
  before_all: function () {
    // clean up testing folder if needed
    var base = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(), "unittest_filesystem_filestream");
    if (base.exists() && base.isDirectory()) {
      base.deleteDirectory(true);
    } else if (base.exists() && base.isFile()) {
      base.deleteFile();
    }

    base.createDirectory();

    this.base = base;
  },

  other_props: function () {
    value_of(Ti.Filesystem.getLineEnding)
      .should_be_function();
    value_of(Ti.Filesystem.getSeparator)
      .should_be_function();

    // these constants are boundt to the same constants bound to Ti.Filesystem
    value_of(Ti.Filesystem.MODE_READ)
      .should_not_be_null();
    value_of(Ti.Filesystem.MODE_WRITE)
      .should_not_be_null();
    value_of(Ti.Filesystem.MODE_APPEND)
      .should_not_be_null();

    value_of(Ti.Filesystem.getLineEnding())
      .should_not_be_null();
    value_of(Ti.Filesystem.getSeparator())
      .should_not_be_null();
  },

  write_read: function () {
    var textToWrite = "This is the text to write in the file";
    var fs = Ti.Filesystem.getFileStream(this.base, "writeTestFile.txt");

    // these are only defined when you have an instance of filesystem.
    value_of(fs.MODE_APPEND)
      .should_be(Ti.Filesystem.MODE_APPEND);
    value_of(fs.MODE_READ)
      .should_be(Ti.Filesystem.MODE_READ);
    value_of(fs.MODE_WRITE)
      .should_be(Ti.Filesystem.MODE_WRITE);

    // this should return false, file isn't open
    value_of(fs.isOpen())
      .should_be_false();
    value_of(fs.ready())
      .should_be_false();

    fs.open(Ti.Filesystem.MODE_WRITE);

    // bug #36 - isOpen should return true here.
    // both isOpen() and ready() should return true here.
    value_of(fs.isOpen())
      .should_be_true();
    value_of(fs.ready())
      .should_be_true();

    fs.write(textToWrite);

    fs.close();

    var f = Ti.Filesystem.getFile(this.base, "writeTestFile.txt");
    value_of(f)
      .should_not_be_null();
    value_of(f.exists())
      .should_be_true();

    // read back the file contents
    fs.open(Ti.Filesystem.MODE_READ);
    var textRead = fs.read();
    fs.close();
    value_of(textRead)
      .should_be_object();
    value_of(textToWrite)
      .should_be(textRead);

    // test the blob interface
    value_of(textRead.length)
      .should_be_number();
    value_of(textRead.length)
      .should_be(textToWrite.length);
    value_of(textRead.toString())
      .should_be(textToWrite);
    value_of(textRead.charAt(0))
      .should_be(textToWrite.charAt(0));
    value_of(textRead.substring(0))
      .should_be(textToWrite.substring(0));
    value_of(textRead.substring(0, 2))
      .should_be(textToWrite.substring(0, 2));
    value_of(textRead.toUpperCase())
      .should_be(textToWrite.toUpperCase());
    value_of(textRead.toLowerCase())
      .should_be(textToWrite.toLowerCase());
    value_of(textRead.indexOf('i'))
      .should_be(textToWrite.indexOf('i'));
    value_of(textRead.lastIndexOf('l'))
      .should_be(textToWrite.lastIndexOf('l'));
  },

  write_new_line: function () {
    var filename = "writeAppendTestFile.txt";
    var textToWrite = "Line";

    var fs = Ti.Filesystem.getFileStream(this.base, filename);
    fs.open(Ti.Filesystem.MODE_WRITE);
    fs.writeLine(textToWrite);
    fs.close();

    var fs2 = Ti.Filesystem.getFileStream(this.base, filename);
    fs2.open(Ti.Filesystem.MODE_READ);
    var expectedText = fs2.readLine();
    fs2.close();


    value_of(expectedText)
      .should_be(textToWrite);

    var fs3 = Ti.Filesystem.getFileStream(this.base, filename);
    fs3.open(Ti.Filesystem.MODE_READ);
    var expectedText2 = fs3.read();
    fs3.close();

    // must exclude the new line
    value_of(expectedText2)
      .should_not_be(textToWrite);
    if (Ti.platform == 'win32') {
      value_of(expectedText2)
        .should_be(textToWrite + '\r\n');
    } else {
      value_of(expectedText2)
        .should_be(textToWrite + '\n');
    }
  },

  write_append_read: function () {
    var filename = "writeAppendTestFile.txt";
    var textToWrite = "This is the text to write in the file.";
    var textToAppend = "This is the text to append.";

    var fs = Ti.Filesystem.getFileStream(this.base, filename);
    fs.open(Ti.Filesystem.MODE_WRITE);
    fs.write(textToWrite);
    fs.close();

    fs = Ti.Filesystem.getFileStream(this.base, filename);
    fs.open(Ti.Filesystem.MODE_APPEND);
    fs.write(textToAppend);
    fs.close();

    var f = Ti.Filesystem.getFile(this.base, filename);
    value_of(f)
      .should_not_be_null();
    value_of(f.exists())
      .should_be_true();

    // read back the file contents
    fs.open(Ti.Filesystem.MODE_READ);
    var textRead = fs.read();
    fs.close();
    value_of(textToWrite + textToAppend)
      .should_be(textRead);
  },
  // old JIRA issues for regression
  TI328_open_and_write_filestream: function () {
    var filename = ".data.txt";
    var contents = "this is some data";
    var userDir = Ti.Filesystem.getUserDirectory();
    var sessionFile = Ti.Filesystem.getFile(userDir, filename);
    var sessionStream = Ti.Filesystem.getFileStream(sessionFile);
    sessionStream.open(Ti.Filesystem.MODE_WRITE);
    sessionStream.write(contents);
    sessionStream.close();

    value_of(sessionFile.exists())
      .should_be_true();
    value_of(sessionFile.size())
      .should_be(contents.length);
    sessionFile.deleteFile();
    value_of(sessionFile.exists())
      .should_be_false();
  },

  test_read_partial: function () {
    var f = Ti.Filesystem.getFile(Ti.Filesystem.getResourcesDirectory(), "test.txt");
    var s = f.open(Ti.Filesystem.MODE_READ);

    var one = s.read(3);
    value_of(one.toString())
      .should_be("one");
    var two = s.read(3);
    value_of(two.toString())
      .should_be("two");
    var three = s.read(5);
    value_of(three.toString())
      .should_be("three");

    s.close();
  },

  test_seek_tell: function () {
    var f = Ti.Filesystem.getFile(Ti.Filesystem.getResourcesDirectory(), "test.txt");
    var s = f.open(Ti.Filesystem.MODE_READ);

    // Seek from start
    s.seek(11);
    value_of(s.tell())
      .should_be(11);
    var four = s.read(4);
    value_of(four.toString())
      .should_be("four");

    // Seek from current position
    s.seek(-12, Ti.Filesystem.SEEK_CURRENT);
    value_of(s.tell())
      .should_be(3);
    var two = s.read(3);
    value_of(two.toString())
      .should_be("two");

    s.close();
  }

});