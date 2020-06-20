// 初期表示処理

document.addEventListener('init', function(event) {
    var page = event.target;
    if (page.id == "profile-page") {
      if(loginCheck()){
        location.href = "main.html";
      }
      getFollowerNum();
      var galleryThumbs = new Swiper('.tab-menu', {
        spaceBetween: 20,
        slidesPerView: 'auto',
        freeMode: false,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
      });
      var galleryTop = new Swiper('.tab-contents', {
        autoHeight: true,
        thumbs: {
          swiper: galleryThumbs
        }
      });
    }
});

// 表示時処理
document.addEventListener('show', function(event) {
  var page = event.target;
  if (page.id == "profile-page") {
    jumpUserObjectId = '';
    dispMyProfileInfo();
    getMyPhotoList();
    getFavoritePhotoList();
    return;
  //   showProfilePage($(page));
  }
  if (page.id == "profile-edit") {
    dispMyProfileEdit();
    setClickMyphoto($(page));
    return;
  }
});

const dispMyProfileEdit = () => {
  $('#user_name').val(current_user.userName);
  if ( current_user.height == undefined ) {
    $('#height').val('');
  } else {
    $('#height').val(current_user.height);
  }
  if ( current_user.sex == undefined ) {
    $('#sex-1').prop('checked', true)
  } else {
    if( current_user.sex == 'MEN' ){
      $('#sex-1').prop('checked', true)
    }else{
      $('#sex-2').prop('checked', true)
    }
  }
  if ( current_user.old == undefined ) {
    $('#old').val('');
  } else {
    $('#old').val(current_user.old);
  }
}

const dispMyProfileInfo = () => {
  $('.profile_image_main').attr("src", current_user.profileImage);
  $('#profile_user_id').html('@' + current_user.objectId);
  $('#profile_info_name').html(current_user.userName);
  if ( current_user.height == undefined ) {
    $('#profile_height').html(' - cm');
  } else {
    $('#profile_height').html(current_user.height + 'cm');
  }
  if ( current_user.sex == undefined ) {
    $('#profile_sex').html(' - ');
  } else {
    $('#profile_sex').html(current_user.sex);
  }
  if ( current_user.follows == undefined ) {
    $('#profile_follow_num').html('0');
  } else {
    $('#profile_follow_num').html(current_user.follows.length);
  }
  $('#profile_follower_num').html(follower_num);
}

const getMyPhotoList = () => {
  const Photo = ncmb.DataStore('Photo');
  Photo
    .limit(10)
    .equalTo('userObjectId', current_user.objectId)
    .order('createDate')
    .fetchAll()
    .then((photos) => {
      updateMyPhotoListDisp(photos);
    });
}

const getFavoritePhotoList = () => {
  const Like = ncmb.DataStore('Like');
  const Photo = ncmb.DataStore('Photo');
  Like
    .inArray("users", [current_user.objectId])
    .fetchAll()
    .then((likes) => {
      let like_array = [];
      let like_keys = Object.keys(likes);
      let maxnum = Object.keys(likes).length;
      for (let i = 0; i < maxnum; i++) {
        let current_like = likes[like_keys[i]];
        like_array.push(current_like.photoObjectId);
      }
      console.log(like_array);
      Photo
        .limit(10)
        .in('objectId', like_array)
        .order('createDate')
        .fetchAll()
        .then((photos) => {
          updateFavoritePhotoListDisp(photos);
        });    
    });
}



const profileSave = () => {
//  if($('#profileImageFile').val()!=''){
//    waitAndUploadMyphoto();
//  }
  var upd_user_name = $('#user_name').val();
  var upd_height = $('#height').val();
  var upd_old = $('#old').val();
  var upd_sex = '';
  if($('#sex-2:checked').get().length == 1){ upd_sex = 'WOMEN'; }else{ upd_sex = 'MEN'; }
  current_user
    .set('userName', upd_user_name)
    .set('height', upd_height)
    .set('old', upd_old)
    .set('sex', upd_sex)
    .set('authData', {})  // ないとエラーになります
    .update()
    .then((save_user) => {
      // photoも全て更新
      const Photo = ncmb.DataStore('Photo');
      Photo
        .equalTo('userObjectId', current_user.objectId)
        .fetchAll()
        .then((photos) => {
          let maxnum = Object.keys(photos).length;
          let photo_keys = Object.keys(photos);
          for (let i = 0; i < maxnum; i++) {
            let current_photo = photos[photo_keys[i]];
            current_photo
              .set('user', save_user)
              .set('authData', {})  // ないとエラーになります
              .update()
              .then((result) => {
              });
          }
        });
      createAlertDialog('edit-notice1');
      nav.popPage();
    })
}

//const clickProfileImageFile = (e) => {
const setClickMyphoto = (dom) => {
  dom.find('#profileImageUpload').on('click', (e) => {
    if (ons.platform.isIOS()) {
      $(e.target).click();
    }
    dom.find('#profileImageFile').click();
  });
}

$(document).on('change', '#user_name, #height, #old, #sex-2, #sex-1', (e) => {
  $('.profile_edit_save_off').addClass('profile_edit_save_on').removeClass('profile_edit_save_off');
});

$(document).on('change', '#profileImageFile', (e) => {
  const file = e.target.files[0];
  const fr = new FileReader();
  fr.onload = (e) => {
    const img = new Image();
    img.onload = (e) => {
      loadExif(img)
        .then((exif) => {
          drawImage(img, exif.orientation, "#previewProfileImageFile");
        })
        .then((results) => {
          $('#previewProfileImageComp').show();
          $('.profile_edit_save_off').addClass('profile_edit_save_on').removeClass('profile_edit_save_off');
          // $('#preview').show();
        }, (err) => {
          console.log(err);
        });
    };
    img.src = e.target.result;
  };
  fr.readAsDataURL(file);
});

$(document).on('change', '#profileImageFile', (e) => {
  const file = e.target.files[0];
  fileUpload(`${ncmb.User.getCurrentUser().objectId}-${file.name}`, file)
    .then((fileUrl) => {
      $('.profileImage').attr('src', fileUrl);
      console.log('fileUpload:' + JSON.stringify(fileUrl, null, 2));
      // console.log('fileUpload:' + JSON.stringify(current_user, null, 2));
      // 自分の設定を更新
      return current_user
        // .set('authData', {}) // 執筆時点ではこれがないと更新に失敗します
        .set('profileImage', fileUrl)
        .update()
    })
    .then(() => {
      // console.log('then fileUpload:' + JSON.stringify(file));
    })
    .catch((err) => {
      // console.log('catch fileUpload:' + JSON.stringify(file));
      // ons.notification.alert('fileUpload:' + (JSON.stringify(err)));
      // console.log('catch fileUpload:' + (JSON.stringify(err)));
    })
});

//const waitAndUploadMyphoto = () => {
//  alert("fileUrl go");
//  var pro = new Promise(function(resolve) {
//    resolve(new Date);
//  });
//  setTimeout(() => {
//    pro.then((id) => {
//      const promises = [];
//      const file = canvasToBlobMyphoto();
//      const fileName = `${current_user.objectId}-${(new Date()).getTime()}.jpg`;
//      promises.push(fileUpload(fileName, file));
//      return Promise.all(promises);
//    })
//    .then((results) => {
//      const fileUrl = results[1];
//      alert("fileUrl " + fileUrl);
//      current_user
//        .set('profileImage', fileUrl)
//        .set('authData', {})  // ないとエラーになります
//        .update()
//        .then((e) => {
//        })
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

//const canvasToBlobMyphoto = () => {
//  const type = 'image/jpeg';
//  const canvas = $("#previewProfileImageFile")[0];
//  const dataurl = canvas.toDataURL(type);
//  const bin = atob(dataurl.split(',')[1]);
//  const buffer = new Uint8Array(bin.length);
//  for (let i = 0; i < bin.length; i += 1) {
//    buffer[i] = bin.charCodeAt(i);
//  }
//  const blob = new Blob([buffer.buffer], {type: type});
//  return blob;
//}

let read_my_photo_num = 0;
const updateMyPhotoListDisp = (photos) => {
  //$('.loading').hide();
  let row = document.querySelector('#my_photo_card');
  let col = row.querySelector(".my_photo_card_col");
  let maxnum = Object.keys(photos).length;
  let photo_keys = Object.keys(photos);
  if(photos.length == 0){$('#profile_my_photo_msg').show();}else{$('#profile_my_photo_msg').hide();}
  if(read_my_photo_num == maxnum){return;}
  read_my_photo_num = maxnum;
  $('#my_photos').empty();
  for (let i = 0; i < maxnum / 3; i++) {
    let row_clone = row.cloneNode(false);
    row_clone.id = '';
    row_clone.style = '';
    for (let j =  i * 3; j < (i + 1) * 3; j++) {
      let current_photo = photos[photo_keys[j]];
      let col_clone;
      if (j >= maxnum) {
          col_clone = col.cloneNode(false);
          col_clone.id = '';
      } else {
          col_clone = col.cloneNode(true);
          col_clone.id = String(current_photo.objectId);
          let ons_card = col_clone.querySelector(".my_photo_card_card");
          let img = new Image();
          img.src = current_photo.fileUrl;
          $(img).on('load', function() {
              img.classList.add('my_photo');
              img.setAttribute("onclick", "tapPhoto('"+current_photo.objectId+"')");
              ons_card.prepend(img);
          });
      }
      col_clone.classList.add("fade_in");
      row_clone.append(col_clone);
    }
    $('#my_photos').append(row_clone);
  }
};

let read_favorite_photo_num = 0;
const updateFavoritePhotoListDisp = (photos) => {
  //$('.loading').hide();
  let row = document.querySelector('#favorite_photo_card');
  let col = row.querySelector(".favorite_photo_card_col");
  let maxnum = Object.keys(photos).length;
  let photo_keys = Object.keys(photos);
  if(photos.length == 0){$('#profile_favorite_photo_msg').show();}else{$('#profile_favorite_photo_msg').hide();}
  if(read_favorite_photo_num == maxnum){return;}
  read_favorite_photo_num = maxnum;
  $('#favorite_photos').empty();
  for (let i = 0; i < maxnum / 3; i++) {
    let row_clone = row.cloneNode(false);
    row_clone.id = '';
    row_clone.style = '';
    for (let j =  i * 3; j < (i + 1) * 3; j++) {
      let current_photo = photos[photo_keys[j]];
      let col_clone;
      if (j >= maxnum) {
          col_clone = col.cloneNode(false);
          col_clone.id = '';
      } else {
          col_clone = col.cloneNode(true);
          col_clone.id = String(current_photo.objectId);
          let ons_card = col_clone.querySelector(".favorite_photo_card_card");
          let img = new Image();
          img.src = current_photo.fileUrl;
          $(img).on('load', function() {
              img.classList.add('favorite_photo');
              img.setAttribute("onclick", "tapPhoto('"+current_photo.objectId+"')");
              ons_card.prepend(img);
          });
      }
      col_clone.classList.add("fade_in");
      row_clone.append(col_clone);
    }
    $('#favorite_photos').append(row_clone);
  }
};