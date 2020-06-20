let item_num = 1;
let imgflg = 0;

// 初期表示処理
document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.id == "camera-page") {
  }
});

document.addEventListener('show', function(event) {

  var page = event.target;
  if (page.id == 'camera-page') {
    // 初期化
    $('#preview-01').hide();

    cvs = document.getElementById('preview-01');
    ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 500, 500);
    $('#preview-plus-01').show();

    $('#preview-02').hide();

    cvs = document.getElementById('preview-02');
    ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 500, 500);
    $('#preview-plus-02').show();

    $('#preview-03').hide();

    cvs = document.getElementById('preview-03');
    ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, 500, 500);

    $('#preview-plus-03').show();
    item_num = 1;
    imgflg = 0;
    // cameraImageFile-03 の次に追加
    $("[class^='camera_edit_area_head_']").remove();
    $("[class^='camera_edit_area_body_']").remove();
    $("[class^='list camera_edit_area_body_']").remove();
    $copy_head = $(".tmp_camera_edit_area_head").clone(true, false);
    $("#cameraImageFile-03").after($copy_head);
    $(".tmp_camera_edit_area_head:eq(0)").addClass('camera_edit_area_head_' + item_num).removeClass('tmp_camera_edit_area_head');
    $('.camera_edit_area_head_' + item_num).show();
    $copy_body = $(".tmp_camera_edit_area_body").clone(true, false);
    $('.camera_edit_area_head_' + item_num).after($copy_body);
    $(".tmp_camera_edit_area_body:eq(0)").addClass('camera_edit_area_body_' + item_num).removeClass('tmp_camera_edit_area_body');
    $('.camera_edit_area_body_' + item_num).show();
    // showCameraPage($(page));
    return;
  }
});

// const showCameraPage = (dom) => {
// }

const camera_add = () => {
  item_num++;
  $copy_head = $(".tmp_camera_edit_area_head").clone(true, false);
  $copy_head.html($copy_head.html().split('_1').join('_' + item_num).replace('camera_add();', '').replace('商品情報1', '商品情報' + item_num));
  $(".camera_edit_area_body_" + (item_num - 1)).after($copy_head);
  $(".tmp_camera_edit_area_head:eq(0)").addClass('camera_edit_area_head_' + item_num).removeClass('tmp_camera_edit_area_head');
  $('.camera_edit_area_head_' + item_num).show();
  $('.camera_add_button_' + item_num).hide();
  $copy_body = $(".tmp_camera_edit_area_body").clone(true, false);
  $copy_body.html($copy_body.html().split('_1').join('_' + item_num));
  $('.camera_edit_area_head_' + item_num).after($copy_body);
  $(".tmp_camera_edit_area_body:eq(0)").addClass('camera_edit_area_body_' + item_num).removeClass('tmp_camera_edit_area_body');
  $('.camera_edit_area_body_' + item_num).show();
};

const cameraSave = () => {
  if ( $("#camera-page .camera_edit_save_on").get(0) ) {
    var pro = new Promise(function(resolve) {
      resolve(new Date);
    });
    setTimeout(() => {
      pro.then((id) => {
        const Photo = ncmb.DataStore('Photo');
        const photo = new Photo();
        photo
          .set('user', current_user)
          .set('authData', {})
          .set('userObjectId', current_user.objectId);
        return photo.save();
      })
      .then((photo) => {
        let photoObjectId = photo.objectId;
        
        let image_01 = document.getElementById("cameraImageFile-01").files[0];
        if ( image_01 != undefined ) {
          fileUpload(`${ncmb.User.getCurrentUser().objectId}-${image_01.name}`, image_01)
          .then((fileUrl) => {
            // console.log('fileUpload-01:' + JSON.stringify(fileUrl, null, 2));
            const Photo = ncmb.DataStore('Photo');
            Photo.equalTo("objectId", photoObjectId)
                .fetch()
                .then(function(results) {
                    results.set('fileUrl', fileUrl);
                    return results.update();
                });
          })
        }
      
        let image_02 = document.getElementById("cameraImageFile-02").files[0];
        if ( image_02 != undefined ) {
          fileUpload(`${ncmb.User.getCurrentUser().objectId}-${image_02.name}`, image_02)
          .then((fileUrl) => {
            // console.log('fileUpload-02:' + JSON.stringify(fileUrl, null, 2));
            const Photo = ncmb.DataStore('Photo');
            Photo.equalTo("objectId", photoObjectId)
                .fetch()
                .then(function(results) {
                    results.set('fileUrl2', fileUrl);
                    return results.update();
                });
          })
        }

        let image_03 = document.getElementById("cameraImageFile-03").files[0];
        if ( image_03 != undefined ) {
          fileUpload(`${ncmb.User.getCurrentUser().objectId}-${image_03.name}`, image_03)
          .then((fileUrl) => {
            // console.log('fileUpload-03:' + JSON.stringify(fileUrl, null, 2));
            const Photo = ncmb.DataStore('Photo');
            Photo.equalTo("objectId", photoObjectId)
                .fetch()
                .then(function(results) {
                    results.set('fileUrl3', fileUrl);
                    return results.update();
                });
          })
        }

        //if($('#cameraImageFile-01').val()!=''){
        //  waitAndUploadItemImage('preview-01', 'fileUrl', photoObjectId);
        //}
        //console.log('result photo1');
        //console.log(photo);
        //if($('#cameraImageFile-02').val()!=''){
        //  waitAndUploadItemImage('preview-02', 'fileUrl2', photoObjectId);
        //}
        //console.log('result photo2');
        //console.log(photo);
        //if($('#cameraImageFile-03').val()!=''){
        //  waitAndUploadItemImage('preview-03', 'fileUrl3', photoObjectId);
        //}
        //console.log('result photo3');
        //console.log(photo);
        for (let i = 1; i < 11; i++) {
          if ( $("#camera-page .camera_edit_area_body_" + i).get(0) ) {
            let api_ret = $.ajax({
              type: 'GET',
              url: "http://v118-27-15-187.4cwv.static.cnode.io/?product_name="+$("#item_name_"+i).val()+"&jancode="+$("#jan_code_"+i).val()+"&auth=B042B6D55DA9458BCBEC80C329A637CAFEDE1",
              async: false
            });

            // console.log(api_ret);

            let api_res = api_ret.responseText

            let amazon_image = '';
            let amazon_url = '';
            let amazon_title = '';

            if ( api_res != undefined && api_res.length != 3 ) {
              let api_res_json = JSON.parse(api_res.replace(/'/g, '"'));
              amazon_image = api_res_json.get_img;
              amazon_url = api_res_json.get_url;
              amazon_title = api_res_json.get_title;
              // console.log(api_res_json);
            // } else {
              // console.log(api_res);
            }

            const Item = ncmb.DataStore('Item');
            const item = new Item();
            item
              .set('photoObjectId', photoObjectId)
              .set('amazonImage', amazon_image)
              .set('amazonUrl', amazon_url)
              .set('amazonTitle', amazon_title)
              .set('name', $("#item_name_"+i).val())
              .set('category', $("#category_"+i).val())
              .set('color', $("#color_"+i).val())
              .set('size', $("#size_"+i).val())
              .set('brand', $("#brand_"+i).val())
              .set('jan_code', $("#jan_code_"+i).val());
            item.save();
          }
        }
        createAlertDialog('camera-notice1');
        $('.posts').empty();
        timelineDisp = 0;
        // $('#nav')[0].pushPage('home.html');
      })
    })
  }
};

//const waitAndUploadItemImage = (item_id, col_name, photoObjectId) => {
//  var pro = new Promise(function(resolve) {
//    resolve(new Date);
//  });
//  setTimeout(() => {
//    pro.then((id) => {
//      const promises = [];
//      const file = canvasToBlobItemImage(item_id);
//      const fileName = `${item_id}-${current_user.objectId}-${(new Date()).getTime()}.jpg`;
//      promises.push(fileUpload(fileName, file));
//      return Promise.all(promises);
//    })
//    .then((results) => {
//      const fileUrl = results[1];
//      const Photo = ncmb.DataStore('Photo');
//      Photo.equalTo("objectId", photoObjectId)
//          .fetch()
//          .then(function(results) {
//            alert("objectId " + photoObjectId + " " + col_name + " に " + fileUrl + " を更新");
//              results.set(col_name, fileUrl);
//              return results.update();
//          });
////        .set('authData', {})  // ないとエラーになります
//    })
//    .catch((err) => {
//      console.log(err);
//      if (err === 1) {
//        return;
//      }
//      //ons.notification.alert(JSON.stringify(err));
//    })
//  }, 3000);
//}

//const canvasToBlobItemImage = (item_id) => {
//  const type = 'image/jpeg';
//  const canvas = $("#" + item_id)[0];
//  const dataurl = canvas.toDataURL(type);
//  const bin = atob(dataurl.split(',')[1]);
//  const buffer = new Uint8Array(bin.length);
//  for (let i = 0; i < bin.length; i += 1) {
//    buffer[i] = bin.charCodeAt(i);
//  }
//  const blob = new Blob([buffer.buffer], {type: type});
//  return blob;
//}

$(document).on('click', '.camera-view-01', (e) => {
  // alert("click " + imgflg);
  if (ons.platform.isIOS()) {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-01').click();
      imgflg = 1;
    }
  } else {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-01').click();
      imgflg = 1;
    }  
  }
  return false;
});
$(document).on('click', '.camera-view-02', (e) => {
  // alert("click " + imgflg);
  if (ons.platform.isIOS()) {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-01').click();
      imgflg = 1;
    }
  } else {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-02').click();
      imgflg = 1;
    }
  }
  return false;
});
$(document).on('click', '.camera-view-03', (e) => {
  // alert("click " + imgflg);
  if (ons.platform.isIOS()) {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-01').click();
      imgflg = 1;
    }
  } else {
    if ( imgflg == 0 ) {
      $(document).find('#cameraImageFile-03').click();
      imgflg = 1;
    }
  }
  return false;
});

// $(document).on("click", "#cameraImageFile-01", function() {
//   $(this).click();
// });

$(document).on('change', '#cameraImageFile-01', (e) => {
  const file = e.target.files[0];
  const fr = new FileReader();
  fr.onload = (e) => {
    const img = new Image();
    img.onload = (e) => {
      loadExif(img)
        .then((exif) => {
          drawImage(img, exif.orientation, "#preview-01");
        })
        .then((results) => {
          $('#preview-plus-01').hide();
          $('#preview-01').show();
          imgflg = 0;
        }, (err) => {
          console.log(err);
        });
    };
    img.src = e.target.result;
  };
  fr.readAsDataURL(file);
});
$(document).on('change', '#cameraImageFile-02', (e) => {
  const file = e.target.files[0];
  const fr = new FileReader();
  fr.onload = (e) => {
    const img = new Image();
    img.onload = (e) => {
      loadExif(img)
        .then((exif) => {
          drawImage(img, exif.orientation, "#preview-02");
        })
        .then((results) => {
          $('#preview-plus-02').hide();
          $('#preview-02').show();
          imgflg = 0;
        }, (err) => {
          console.log(err);
        });
    };
    img.src = e.target.result;
  };
  fr.readAsDataURL(file);
});
$(document).on('change', '#cameraImageFile-03', (e) => {
  const file = e.target.files[0];
  const fr = new FileReader();
  fr.onload = (e) => {
    const img = new Image();
    img.onload = (e) => {
      loadExif(img)
        .then((exif) => {
          drawImage(img, exif.orientation, "#preview-03");
        })
        .then((results) => {
          $('#preview-plus-03').hide();
          $('#preview-03').show();
          imgflg = 0;
        }, (err) => {
          console.log(err);
        });
    };
    img.src = e.target.result;
  };
  fr.readAsDataURL(file);
});