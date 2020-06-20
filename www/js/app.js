
let acl_init = 0;

// 初期表示処理
document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.id == "home-page") {
    if (current_user && acl_init == 0) {
      var user = ncmb.User.getCurrentUser();
      var acl = new ncmb.Acl;
      acl.setPublicReadAccess(true).setUserWriteAccess(user, true);
      user
        .set('authData', {})
        .set('acl', acl)
        .update()
        .then(() => {
          acl_init = 1;
        })
        .catch((err) => {
        })
    }
  }

  //  var page = event.target;
//  loginCheck();
//  if (!current_user) {
//    $('#nav')[0].resetToPage('login.html', {animation: 'fade'});
//  } else {
//    loadTimeline();
//  }	
//  if (page.id === 'main') {
//  }else if (page.id == "home-page") {
//  }else if (page.id == 'profile-page') {
//    //getMyPhotos();
//  }else if (page.id == "search-page") {
//    //$('.loading').hide();
//  }
});

// if (current_user) {
//   ncmb.User
//     .equalTo('objectId', current_user.objectId)
//     .fetch()
//     .then((user) => {
//       current_user = user;
//     })
//     .catch((err) => {
//       console.error(err);
//     })
// }


// const aclUpdate = () => {
//   var user = ncmb.User.getCurrentUser();
//   var acl = new ncmb.Acl;
//   acl.setPublicReadAccess(true).setUserWriteAccess(user, true);
//   user
//     .set('authData', {})
//     .set('acl', acl)
//     .update()
//     .then(() => {
//       return true;
//     })
//     .catch((err) => {
//       return false;
//     });
// }



const myPhotos = new Proxy({}, {
  set: (target, key, value) => {
    if (!target[key]) {
      target[key] = value;
      updateMyPhotos($('#grid_view'), target);
    }
    oneTimelinePhotos[key] = value;
  }
});

const oneTimelinePhotos = new Proxy({}, {
  set: (target, key, value) => {
    if (!target[key]) {
      target[key] = value;
      updateTimeline(target);
    }
  }
});

// const sumTimelinePhotos = new Proxy({}, {
//   set: (target, key, value) => {
//     if (!target[key]) {
//       target[key] = value;
//       updateTimeline(target);
//     }
//   }
// });

const searchPhoto = (e) => {
  let allFlg = 0;
  const dom = $('#search-page');
  const photoView = dom.find('#photos');
  const Photo = ncmb.DataStore('Photo');
  const Item = ncmb.DataStore('Item');
  if (e.keyCode === 13 && 
     (e.shiftKey === false || e.ctrlKey === false || e.altKey === false)
   ) {
  } else {
    // 通常入力
    return true;
  }
  // 検索実行
  if (e.target.value.trim() === '') {
    allFlg = 1;
  }
  // スペースで分割
  const keywords = e.target.value.split(' ');
  const aryOr = [];
  let items_arr = [];
  let results = null;
  let results2 = null;
  // let error = null;
  // let error2 = null;

  (async () => {

    if ( allFlg == 1 ) {
      results = await p(Item.fetchAll());
      for (let i in results) {
        const item = results[i];
        if ( item.photoObjectId != '' && items_arr.indexOf(item.photoObjectId) < 0 ) { // && !item.photoObjectId in items_arr
          items_arr.push(item.photoObjectId);
        }
      }
    } else {
      for (let i = 0; i < keywords.length; i += 1) {
        const keyword = keywords[i];
        results = await p(Item.regularExpressionTo("brand", `.*${keyword}.*`).fetchAll());
        results2 = await p(Item.regularExpressionTo("name", `.*${keyword}.*`).fetchAll());
        for (let i in results) {
          const item = results[i];
          if ( item.photoObjectId != '' && items_arr.indexOf(item.photoObjectId) < 0 ) { // && !item.photoObjectId in items_arr
            items_arr.push(item.photoObjectId);
          }
        }
        for (let i in results2) {
          const item = results2[i];
          if ( item.photoObjectId != '' && items_arr.indexOf(item.photoObjectId) < 0 ) {
            items_arr.push(item.photoObjectId);
          }
        }
      }
    }

    console.log(items_arr);
    $(photoView).hide();
    const thumbnailTemplate = $('#searchThumbnailTemplate').html();
    presults = await p(Photo.in('objectId', items_arr).include('user').order('-createDate').fetchAll());
    updateSearch(presults);
    $(photoView).show();
    $('.loading').hide();
  })();
};

const p = (func) => {
  return new Promise(res => {
    func
      .then(result => res(result, null))
      .catch(error => res(null, error));
  })
};

const tapPhoto = (objectId) => {
  const Photo = ncmb.DataStore('Photo');
  Photo
    .equalTo('objectId', objectId)
    .fetch()
    .then((photo) => {
      $('#nav')[0].pushPage('single.html', {animation: 'slide', data: {photo: photo}});
    });
}

const tapUser = (objectId) => {
  jumpUserObjectId = objectId;
  $('#nav')[0].pushPage('user.html', {animation: 'slide', data: {}}); //photo: photo
}
    
const showPhotos = (dom, Photo) => {
  return new Promise((res, rej) => {
    $(dom).hide();
    const thumbnailTemplate = $('#thumbnailTemplate').html();
    Photo
      .limit(20)
      .include('user')
      .order('-createDate')
      .fetchAll()
      .then((photos) => {
        const thumbnail = Mustache.render(thumbnailTemplate, {
          photos: photos
        });
        console.log(dom);
        $(dom).html(ons.createElement(thumbnail));
        $(dom).show();
        $('.loading').hide();
        res(photos);
      });
  });
}

const getMyPhotos = () => {
  if (!current_user) {
    return;
  }
  const Photo = ncmb.DataStore('Photo');
  Photo
  .limit(20)
  .equalTo('userObjectId', current_user.objectId)
  .fetchAll()
  .then((photos) => {
    for (let i = 0; i < photos.length; i += 1) {
      const photo = photos[i];
      photo.user = current_user;
      myPhotos[photo.objectId] = photo;
    }
  });
}

const editProfile = () => {
  $('#editRealName').html(ons.createElement(`
    <ons-input modifier="underbar" onblur="updateRealName(event)" style="width:50%" />
  `));
};

document.addEventListener('show', function(event) {
  var page = event.target;
  console.log(page.id);

  if (page.id == 'single-page') {
    showSinglePage($(page), page.data.photo);
    return;
  }
  
  if (page.id == 'home-page') {
    if ( timelineDisp == 0 ) { loadTimeline(); }
    timelineDisp = 1;
    return;
  }

  if (page.id == 'search-page') {
    searchPhotoList();
    return;
    //showUserPage($(page), page.data.user);
  }

});

const showSinglePage = (dom, photo) => { 
  dom.find('.post').empty();
  const Like = ncmb.DataStore('Like');
  Like
    .equalTo('photoObjectId', photo.objectId)
    .fetch()
    .then((like) => {
      appendPhoto(dom.find('.post'), photo, like, "1");
    });
  dom.find('.photo-title').text(photo.message);
}

const showProfilePage = (dom) => {
  dom.find('#profileImageUpload').on('click', (e) => {
    if (ons.platform.isIOS()) {
      $(e.target).click();
    }
    dom.find('#profileImageFile').click();
  });
}

const showCameraPageBk = (dom) => {
  dom.find('.cameraPlaceholder').show();
  dom.find('#preview').hide();
  dom.find('#latitude').val('');
  dom.find('#longitude').val('');
  dom.find('#location').val('');
  dom.find('.select-photo').on('click', (e) => {
    if (ons.platform.isIOS()) {
      $(e.target).click();
    }
    dom.find('#cameraImageFile').click();
  });

  dom.on('change', '#cameraImageFile', (e) => {
    const file = e.target.files[0];
    const fr = new FileReader();
    fr.onload = (e) => {
      const img = new Image();
      img.onload = (e) => {
        loadExif(img)
          .then((exif) => {
            drawImage(img, exif.orientation, "#preview");
            waitAndUpload();
            return getAddress(exif)
          })
          .then((results) => {
            $('.cameraPlaceholder').hide();
            $('#preview').show();
            $('#latitude').val(results.latitude);
            $('#longitude').val(results.longitude);
            $('#location').val(results.address);
          }, (err) => {
            console.log(err);
          });
      };
      img.src = e.target.result;
    };
    fr.readAsDataURL(file);
  });
}
/*
* This function is used to toggle the grid/list display of the posts in the profile page as well as
* change the color of the buttons to show which is the current view.
*/

function display(id) {
  $("#list").style.color="#1f1f21";
  $("#grid").style.color="#1f1f21";
  $(`#${id}`).style.color="#5fb4f4";

  $("#list_view").style.display="none";
  $("#grid_view").style.display="none";
  $(`${id}_view`).style.display="block";
}

//The generateStoryBubbles function is used to create the carousel items be used as stories by the upper two events.

function generateStoryBubbles(element) {
  const html = [];
  for(var i=0; i<9; i++) {
    html.push(ons.createElement(
      '<ons-carousel-item>' +
        '<div class="story">' +
        '<div class="story-thumbnail-wraper unread"><img class="story-thumbnail" src="img/profile-image-0' + (i+1) + '.png" onclick="readStory(this)"></div>' +
        '<p>david_graham</p>' +
        '</div>' +
      '</ons-carousel-item>'
    ).outerHTML);
  }
  element.html(html.join('&nbsp;'));
}

//The Like function is used to make the white heart appear in front of the picture as well as make the like button into a red heart and vice versa.

const like = (num) => {
  console.log(num);
  if ($(".button-post-like-"+num).hasClass("like")) {
    // Like済み
    $(".button-post-like-"+num)
      .removeClass('ion-ios-heart like')
      .addClass('ion-ios-heart-outline');
  } else {
    // まだLikeしていない
    $(".button-post-like-"+num)
      .removeClass('ion-ios-heart-outline')
      .addClass('ion-ios-heart like');
    // 写真の上のハート表示/600ms後に消す処理
    $(".post-like-"+num).css("opacity", 1);
    setTimeout(function(){
      $(".post-like-"+num).css('opacity', 0);
    }, 600);
  }
  likeCreateOrUpdate(num.replace(/^post\-/, ''));
}

const comment = (num) => {
  ons.notification.prompt({
    message: 'コメントの入力'
  })
  .then((text) => {
    if (text) {
      likeCreateOrUpdate(num.replace(/^post\-/, ''), text);
      const messageTemplate = $('#comment').html();
      const message = Mustache.render(messageTemplate, {
        messages: [{
          username: current_user.userName,
          comment: text,
          userObjectId: current_user.objectId
        }]
      });
//          profileImage: current_user.profileImage,
      $(`#${num}`).find('.post-comments').append(ons.createElement(message));
    }
  })
}

const likeCreateOrUpdate = (photoObjectId, comment) => {
  const Like = ncmb.DataStore('Like');
  Like
    .equalTo('photoObjectId', photoObjectId)
    .fetch()
    .then((like) => {
      if (Object.keys(like).length == 0) {
        // データなし
        like = new Like;
        like
          .set('users', [])
          .set('photoObjectId', photoObjectId);
      }
      if (comment) {
        let messages = like.messages;
        const message = {
          username: current_user.userName,
          comment: comment,
          userObjectId: current_user.objectId
        };
        if (messages) {
          messages.push(message);
        } else {
          messages = [message];
        }
        like.set('messages', messages);
      }else{
        if (like.users.indexOf(current_user.objectId) > -1) {
          // データあり
          like.remove('users', current_user.objectId);
        } else {
          if (like.objectId) {
            like.addUnique('users', current_user.objectId);
          } else {
            like.set('users', [current_user.objectId]);
          }
        }
      }
      return like.objectId ? like.update() : like.save();
    })
    .then((like) => {
    })
}

//The readStory function is used to change the red circle around a new story into grey after tapping on the new storry (thus reading it)

var readStory = function(event) {
  $(event).parent().removeClass('unread');
  $(event).parent().addClass('read');
}

const getAddress = (exif) => {
  const results = {
    latitude: '',
    longitude: '',
    address: ''
  };
  return new Promise((res, rej) => {
    const lat = exif.lat;
    const long = exif.long;
    if (lat && long) {
    }else{
      return res(results);
    }
    results.latitude = lat[0] + (lat[1]/60) + (lat[2]/(60*60));
    results.longitude = long[0] + (long[1]/60) + (long[2]/(60*60));
    $.ajax({
      url: `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&y=${results.latitude}&x=${results.longitude}`,
      type: 'GET',
      dataType: 'jsonp'
    })
    .then((response) => {
      const location = response.response.location[0];
      if (location) {
        results.address = `${location.prefecture}${location.city}${location.town}`;
        res(results);
      }
    }, (err) => {
      res(results);
    });
  });
}

const waitAndUpload = () => {
  let photoObjectId;
  setTimeout(() => {
    ons.notification.confirm({
      message: 'Do you want to upload?'
    })
    .then((id) => {
      // id == 1 はOKボタンを押した場合です
      if (id != 1) {
        throw 1;
      }
      const promises = [];
      
      promises.push(ons.notification.prompt({
        message: 'Write your memory!'
      }));
      const file = canvasToBlob();
      const fileName = `${current_user.objectId}-${(new Date()).getTime()}.jpg`;
      promises.push(fileUpload(fileName, file));
      return Promise.all(promises);
    })
    .then((results) => {
      const message = results[0];
      const fileUrl = results[1];
      const Photo = ncmb.DataStore('Photo');
      const latitude = $('#latitude').val();
      const longitude = $('#longitude').val();
      const location = $('#location').val();
      const photo = new Photo();
      photo
        .set('user', current_user)
        .set('userObjectId', current_user.objectId)
        .set('fileUrl', fileUrl)
        .set('message', message)
        .set('location', location);
      if (latitude != '' && longitude != '') {
        //const geoPoint = new ncmb.GeoPoint(Number(latitude), Number(longitude));
        //photo.set('geo', geoPoint);
      }
      return photo.save();
    })
    .then((photo) => {
      // Homeに戻る
      $('#tabbar')[0].setActiveTab(0);
      photo.user = ncmb.User.getCurrentUser();
      myPhotos[photo.objectId] = photo;
      photoObjectId = photo.objectId;
      let photo_count = current_user.photo_count || 0;
      photo_count++;
      current_user.set('photo_count', photo_count);
      return current_user.update();
    })
    .then(() => {

    })
    .catch((err) => {
      console.log(err);
      if (err === 1) {
        return;
      }
      ons.notification.alert(JSON.stringify(err));
    })
  }, 3000);
}

const canvasToBlobBk = () => {
  const type = 'image/jpeg';
  const canvas = $("#preview")[0];
  const dataurl = canvas.toDataURL(type);
  const bin = atob(dataurl.split(',')[1]);
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    buffer[i] = bin.charCodeAt(i);
  }
  const blob = new Blob([buffer.buffer], {type: type});
  return blob;
}

const updateRealName = (e) => {
  const realName = e.target.value;
  ncmb.User.getCurrentUser()
    .set('authData', {})
    .set('realName', realName)
    .update()
    .then(() => {
      // 処理成功した場合は何も出力しない
      $('.realName').html(realName);
    })
    .catch((err) => {
      ons.notification.alert(err.message);
    })
}

// 写真表示をアップデートします
const updateMyPhotos = (dom, photos) => {
  let index = 0;
  let row = 3;
  let divRow = ons.createElement('<ons-row />');
  const template = $('#gridTemplate').html();
  dom.empty();
  for (let key in photos) {
    const photo = photos[key];
    const id = `grid-${photo.objectId}`;
    const content = Mustache.render(template, {
      id: id,
      photo: photo
    });
    if (index == row) {
      dom.append(divRow);
      divRow = ons.createElement('<ons-row />');
      index = 0;
    }
    divRow.appendChild(ons.createElement(content));
    index += 1;
  }
  for (let i = index; i < row; i += 1) {
    divRow.appendChild(ons.createElement('<ons-col class="grid_wrapper" />'));
  }
  dom.append(divRow);
};

// 写真を追加します
const appendPhoto = (dom, photo, like, pageType) => {
  const id = `post-${photo.objectId}`;
  let userIcon = '';
  photo.location = photo.location || '';
  // console.log(photo);
  ncmb.User
    .equalTo('objectId', photo.userObjectId)
    .fetch()
    .then((user) => {
      userIcon = user.profileImage;
      if (userIcon == undefined){
        userIcon = noProfileImage;
      }
      photo.user.userName = user.userName;
      photo.user.objectId = user.objectId;
      let favorite_message = 'No one favorites this photo yet.';
      if (like && Object.keys(like).length > 0) {
        let who = 'someone';
        if (like.users.indexOf(current_user.objectId) > -1) {
          who = 'You';
        }
        favorite_message = `
        <b> ${who} </b> and 
        ${like.users.length - 1} other liked this.`;
      }
      photo.liked   = like && Object.keys(like).length > 0 && like.users.indexOf(current_user.objectId) > -1 ? true : false;
      photo.timeAgo = timeago().format(photo.createDate);
      const messageTemplate = $('#comment').html();
      let messages = "";
      let onclickphoto = "";
      let onclickuser = "";
      if(pageType=="0"){
        const template = $('#photo').html();
        $('.post-comments').show();
        onclickphoto = "tapPhoto('"+photo.objectId+"')";
        onclickuser = "tapUser('"+photo.user.objectId+"')";
        detail_content_render(template, dom, id, photo, favorite_message, messages, onclickphoto, onclickuser, userIcon, pageType);
      }else if(pageType=="1"){
        const template = $('#single_photo').html();
        $('.post-comments').hide();
        onclickuser = "tapUser('"+photo.user.objectId+"')";
        let uoid_arr = [];
        console.log(like.messages);
        if ( like.messages != undefined ) {
          for (let i = 0; i < like.messages.length; i++) {
            uoid_arr.push(like.messages[i].userObjectId);
          }
        }
        let massage_user_hash = {};
        let message_count = 0;
        ncmb.User
          .in('objectId', uoid_arr)
          .fetchAll()
          .then((massage_user) => {
            for (let i = 0; i < massage_user.length; i++) {
              massage_user_hash[massage_user[i].objectId] = massage_user[i].profileImage;
            }
            if ( like.messages != undefined ) {
              message_count = like.messages.length;
              for (let i = 0; i < like.messages.length; i++) {
                if ( like.messages[i].userObjectId in massage_user_hash ) {
                  like.messages[i].profileImage = massage_user_hash[like.messages[i].userObjectId];
                } else {
                  like.messages[i].profileImage = noProfileImage;
                }
              }
            }
            messages = Mustache.render(messageTemplate, {
              messages: like ? like.messages : [],
            });
            detail_content_render(template, dom, id, photo, favorite_message, messages, onclickphoto, onclickuser, userIcon, pageType);
            let like_count = 0;
            if ( like.users != undefined ) {
              like_count = like.users.length;
            }
            $(document).find('#like_count').text(like_count);
            showItem(photo, message_count);
          });
      }
    });
}

const detail_content_render = (template, dom, id, photo, favorite_message, messages, onclickphoto, onclickuser, userIcon, pageType) => {
  const content = Mustache.render(template, {
    id: id,
    photo: photo,
    favorite_message: favorite_message,
    messages: messages,
    onclickphoto: onclickphoto,
    onclickuser: onclickuser,
    user_icon: userIcon
  });
  dom.prepend(ons.createElement(content));

  if ( pageType =="1" ) {
    $('.slider').slick({
      dots:true,
      arrows: true,
      nextArrow: '<button style="right: -25px!important;" class="slick-next"></button>',
      prevArrow: '',
    });
  }
  // $(dom).find('.profile_image').on('click', (e) => {
  //   jumpUserObjectId = photo.userObjectId;
  //   $('#nav')[0].pushPage('user.html', {animation: 'slide', data: {photo: photo}}); //photo: photo
  // });
}

const updateTimeline = (photos) => {
  const Like = ncmb.DataStore('Like');
  let dup_check_photo = [];
  Like
    .in('photoObjectId', Object.keys(photos))
    .fetchAll()
    .then((likes) => {
      for (let i in photos) {
        if ( !dup_check_photo.includes(i) ) {
          const photo = photos[i];
          const like = likes.filter((like) => photo.objectId === like.photoObjectId)[0];
          appendPhoto($('.posts'), photo, like, "0");
          dup_check_photo.push(i);
        }
      }
    });
};

let read_search_num = 0;
const updateSearch = (photos) => {
  $('.loading').hide();
  let row = document.querySelector('#search_thumbnail_card');
  let col = row.querySelector(".search_thumbnail_card_col");
  let maxnum = Object.keys(photos).length;
  let photo_keys = Object.keys(photos);
  if(read_search_num == maxnum){return;}
  read_search_num = maxnum;
  $('#photos').empty();
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
          let ons_card = col_clone.querySelector(".search_thumbnail_card_card");
          let img = new Image();
          img.src = current_photo.fileUrl;
          $(img).on('load', function() {
              img.classList.add('search_thumbnail');
              img.setAttribute("onclick", "tapPhoto('"+current_photo.objectId+"')");
              ons_card.prepend(img);
          });
      }
      col_clone.classList.add("fade_in");
      row_clone.append(col_clone);
    }
    $('#photos').append(row_clone);
  }
};


// タイムライン画像の読み込みです
const loadTimeline = () => {
  const Photo = ncmb.DataStore('Photo');
  const follows = current_user.follows || [];
  let joinFollows = follows.slice();
  joinFollows.push(current_user.objectId)
  Photo
    .limit(10)
    .include('user')
    .in('userObjectId', joinFollows)
    .order('createDate')
    .fetchAll()
    .then((photos) => {
      for (let i = 0; i < photos.length; i += 1) {
        const photo = photos[i];
        sumTimelinePhotos[photo.objectId] = photo;
      }
      updateTimeline(sumTimelinePhotos);
  });
}

const searchPhotoList = () => {
  const Photo = ncmb.DataStore('Photo');
  Photo
    .limit(10)
    .order('createDate')
    .fetchAll()
    .then((photos) => {
      updateSearch(photos);
    });
}




// // 写真を追加します
// const appendPhoto = (dom, photo, like, pageType) => {
//   const id = `post-${photo.objectId}`;
//   let userIcon = '';
//   photo.location = photo.location || '';
//   // console.log('photo.user =>');
//   // console.log(photo.user);
//   // photoに紐づくユーザ情報を最新に
//   console.log('start');
//   ncmb.User
//     .equalTo('objectId', photo.userObjectId)
//     .fetch()
//     .then((user) => {
//   console.log('get user =>');
//   console.log(user);
//   console.log(photo);
//       photo
//         .set('user', user)
//         .save()
//         .then((result) => {
//           console.log('photo save =>');
//           console.log(photo);
        
//           console.log('user =>');
//           console.log(user);

//           // アイコンがない場合は初期値
//           userIcon = user.profileImage;
//           if (userIcon == undefined){
//             userIcon = noProfileImage;
//           }
//           let favorite_message = 'No one favorites this photo yet.';
//           if (like && Object.keys(like).length > 0) {
//             let who = 'someone';
//             if (like.users.indexOf(current_user.objectId) > -1) {
//               who = 'You';
//             }
//             favorite_message = `
//             <b> ${who} </b> and 
//             ${like.users.length - 1} other liked this.`;
//           }
//           const template = $('#photo').html();
//           photo.liked   = like && Object.keys(like).length > 0 && like.users.indexOf(current_user.objectId) > -1 ? true : false;
//           photo.timeAgo = timeago().format(photo.createDate);
//           const messageTemplate = $('#comment').html();
//           let messages = "";
//           if(pageType=="1"){
//             messages = Mustache.render(messageTemplate, {
//               messages: like ? like.messages : []
//             });
//           }
//           let onclickphoto = "";
//           if(pageType=="0"){
//             onclickphoto = "tapPhoto('"+photo.objectId+"')";
//           }
//           const content = Mustache.render(template, {
//             id: id,
//             photo: photo,
//             favorite_message: favorite_message,
//             messages: messages,
//             onclickphoto: onclickphoto,
//             user_icon: userIcon
//           });
//           dom.prepend(ons.createElement(content));
//           $(dom).find('.profile_image').on('click', (e) => {
//             jumpUserObjectId = photo.userObjectId;
//             $('#nav')[0].pushPage('user.html', {animation: 'slide', data: {photo: photo}}); //photo: photo
//           });    
//         });
//     });
// }

const jumpAfiLink = (url) => {
  location.href = url;
};

const showItem = (photo, message_count) => {
  let photoObjectId = photo.objectId;
  let fileUrl = photo.fileUrl;
  let fileUrl2 = photo.fileUrl2;
  let fileUrl3 = photo.fileUrl3;

  let row = document.querySelector('#item_thumbnail_card');
  let col = row.querySelector(".item_thumbnail_card_col");

  const Item = ncmb.DataStore('Item');
  let items_arr = [];
  Item
    .in('photoObjectId', [photoObjectId])
    .fetchAll()
    .then((items) => {
      for (let i in items) {
        const item = items[i];
        if ( item.amazonImage != '' ) {
          items_arr.push(item);
        }
      }

      let maxnum = items_arr.length;
      $('#items').empty();
    
      for (let i = 0; i < maxnum / 3; i++) {
        let row_clone = row.cloneNode(false);
        row_clone.id = '';
        row_clone.style = '';
        for (let j =  i * 3; j < (i + 1) * 3; j++) {
          let current_item = items_arr[j];
          let col_clone;
          if (j >= maxnum) {
              col_clone = col.cloneNode(false);
              col_clone.id = '';
          } else {
              col_clone = col.cloneNode(true);
              col_clone.id = String(current_item.objectId);
              let ons_card = col_clone.querySelector(".item_thumbnail_card_card");
              let img = new Image();
              img.src = current_item.amazonImage;
              //current_item.amazonTitle;
              $(img).on('load', function() {
                  img.classList.add('item_thumbnail');
                  img.setAttribute("onclick", "jumpAfiLink('"+current_item.amazonUrl+"')");
                  ons_card.prepend(img);
              });
//              ons_card.querySelector(".item_title").innerHTML = current_item.amazonTitle;
              ons_card.querySelector(".item_title").innerHTML = "<span>" + current_item.brand + '</span><br><span style="font-size: 0.9rem;">' + current_item.name + '</span><br><span style="font-size: 0.7rem;">' + current_item.category + '</span><br><span style="font-size: 0.9rem;">サイズ:' + current_item.size + "</span>";
              ons_card.querySelector(".item_button").addEventListener('click', event => {
                jumpAfiLink(current_item.amazonUrl);
              });
            }
          col_clone.classList.add("fade_in");
          row_clone.append(col_clone);
        }
        $('#items').append(row_clone);
      }

      // centerMode: true,

      console.log('fileUrl:'+fileUrl);
      console.log('fileUrl2:'+fileUrl2);
      console.log('fileUrl3:'+fileUrl3);
    
      if ( fileUrl == undefined ) {
        $('.slider').slick('slickRemove',0);
        // $(".slider #single-image-01").remove();
      }
      if ( fileUrl2 == undefined ) {
        $('.slider').slick('slickRemove',1);
        // $(".slider #single-image-02").remove();
      }
      if ( fileUrl3 == undefined ) {
        $('.slider').slick('slickRemove',2);
        // $(".slider #single-image-03").remove();
      }

      if ( message_count > 1 ) {
        $(".post-comments .list:gt(0)").hide();
        $(".post-comments").after('<div class="next_comment_link" onclick="showComment();">続きをみる('+message_count+'件)</div>');
      }

    });
};

const showComment = (url) => {
  $(".post-comments .list:gt(0)").show();
  $(".next_comment_link").remove();
};
