// 初期表示処理

document.addEventListener('init', function(event) {
    var page = event.target;
    if (page.id == "user-page") {
      if(loginCheck()){
        location.href = "main.html";
      }
    }
});

// 表示時処理
document.addEventListener('show', function(event) {
  var page = event.target;
  
  if (page.id == "user-page") {
    let userId = jumpUserObjectId;
    getFollowerNum(userId);
    getUserPhotoList(userId);
    ncmb.User
    .equalTo('objectId', userId)
    .fetch()
    .then((user) => {
      dispUserInfo(user);
      userFollowDisp($(page), user);
    });
    return;
  //   showProfilePage($(page));

  }
});

const dispUserInfo = (user) => {
  // ncmb.User
  //   .equalTo('objectId', userId)
  //   .fetch()
  //   .then((user) => {
      $('.user_image_main').attr("src", user.profileImage);
      $('#user_user_id').html('@' + user.objectId);
      $('#user_info_name').html(user.userName);
      if ( user.height == undefined ) {
        $('#user_height').html(' - cm');
      } else {
        $('#user_height').html(user.height + 'cm');
      }
      if ( user.sex == undefined ) {
        $('#user_sex').html(' - ');
      } else {
        $('#user_sex').html(user.sex);
      }
      if ( user.follows == undefined ) {
        $('#user_follow_num').html('0');
      } else {
        $('#user_follow_num').html(user.follows.length);
      }
      $('#user_follower_num').html(follower_num);
    // });
}

const getUserPhotoList = (userId) => {
  const Photo = ncmb.DataStore('Photo');
  Photo
    .limit(10)
    .equalTo('userObjectId', userId)
    .order('createDate')
    .fetchAll()
    .then((photos) => {
      updateUserPhotoListDisp(photos);
    });
}

let read_user_photo_num = 0;
const updateUserPhotoListDisp = (photos) => {
  //$('.loading').hide();
  let row = document.querySelector('#user_photo_card');
  let col = row.querySelector(".user_photo_card_col");
  let maxnum = Object.keys(photos).length;
  let photo_keys = Object.keys(photos);
  if(photos.length == 0){$('#profile_user_photo_msg').show();}
  if(read_user_photo_num == maxnum){return;}
  read_user_photo_num = maxnum;
  $('#user_photos').empty();
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
          let ons_card = col_clone.querySelector(".user_photo_card_card");
          let img = new Image();
          img.src = current_photo.fileUrl;
          $(img).on('load', function() {
              img.classList.add('user_photo');
              img.setAttribute("onclick", "tapPhoto('"+current_photo.objectId+"')");
              ons_card.prepend(img);
          });
      }
      col_clone.classList.add("fade_in");
      row_clone.append(col_clone);
    }
    $('#user_photos').append(row_clone);
  }
};

const userFollowDisp = (dom, user) => {
  if (user.objectId == current_user.objectId) {
    // $(dom).find('.follow').attr('disabled', true);
    $(dom).find('.follow').hide();
    // $(dom).find('.follow').text('自分');
    // $(dom).find('.follow').removeClass('').addClass('');
  }  
  // フォローしているかチェック
  if (isFollow(user.objectId)) {
    $(dom).find('.follow').text('フォロー中');
    $(dom).find('.follow').removeClass('user_button').removeClass('user_button_off').addClass('user_button_off');
  } else {
    $(dom).find('.follow').text('フォローする');
    $(dom).find('.follow').removeClass('user_button').removeClass('user_button_off').addClass('user_button');
  }
  // フォロー/アンフォロー処理
  $(dom).find('.follow').on('click', (e) => {
    let follows = current_user.follows;
    if (!follows) {
      // まだデータがない場合は初期化
      follows = [user.objectId];
    } else {
      // すでにフォローしているかチェック
      if (follows.indexOf(user.objectId) > -1) {
        // フォローしていればアンフォロー
        follows = follows.filter((u) => {
          return (u !== user.objectId);
        });
        $('#user_follower_num').text(Number($('#user_follower_num').text()) - 1);
      } else {
        // フォローしていなければフォロー
        follows.push(user.objectId);
        $('#user_follower_num').text(Number($('#user_follower_num').text()) + 1);
      }
    }
    current_user
      .set('follows', follows)
      .set('authData', {})  // ないとエラーになります
      .update()
      .then(() => {
        // フォロー状態をチェックしてボタンの文字を変更
        if (isFollow(user.objectId)) {
          $(dom).find('.follow').text('フォロー中');
          $(dom).find('.follow').removeClass('user_button').removeClass('user_button_off').addClass('user_button_off');
        } else {
          $(dom).find('.follow').text('フォローする');
          $(dom).find('.follow').removeClass('user_button').removeClass('user_button_off').addClass('user_button');
        }
    })
  });
};
