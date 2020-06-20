
document.addEventListener('init', function(event) {
//  let page_name = window.location.href.split('/').pop();
  let page = event.target;
  if (page.id === 'login') {
    if(loginCheck()){
      location.href = "main.html";
    };
  }
});


 /***
  ログインチェック処理
 **/
const loginCheck = () => {
  if (current_user) {
    current_user
      .set('sessionTest', !current_user.sessionTest)
      .set('authData', {})
      .update()
      .then(() => {
        return true;
//        $('.userName').html(current_user.userName);
//        $('.realName').html(current_user.realName || noProfileName);
//        $('.profileImage').attr('src', current_user.profileImage || noProfileImage);
      })
      .catch((err) => {
        return false;
        //$('#nav')[0].pushPage('login.html', {animation: 'fade'});
      });
  }else{
    return false;
  }
}


 /***
  ログイン処理
 **/
const login = () => {
  const page = $('#loginNavigator')[0].topPage;
  const userName = page.querySelector('#id').value;
  const password = page.querySelector('#password').value;
  ncmb.User.login(userName, password)
  .then(function(e) {

    // console.log('acl update');
    // var acluser = ncmb.User.getCurrentUser();
    // var acl = new ncmb.Acl();
    // acl.setPublicReadAccess(true);
    // acl.setUserWriteAccess(acluser, true);
    // acluser.set("acl", acl);
    // acluser.update();
    // alert("a");

    location.href = "main.html";
  })
  .catch(function(e) {
    ncmb.User.loginWithMailAddress(userName, password)
    .then(function(e){

      // console.log('acl update');
      // var user = ncmb.User.getCurrentUser();
      // alert(user);
      // var acl = new ncmb.Acl;
      // acl.setPublicReadAccess(true).setUserWriteAccess(user, true);
      // user
      //   .set('authData', {})
      //   .set('acl', acl)
      //   .update()
      //   .then(() => {
      //     alert("OK");
      //   })
      //   .catch((err) => {
      //     alert(err.message);
      //     ons.notification.alert(err.message);
      //   })

      // console.log(acluser);
      // var acl = new ncmb.Acl();
        // user.setACL({"*": {"read": true}});
        // user.update();
      // console.log(acluser);
      // alert("a");
      // console.log(acluser);
      // alert("a");
      
      location.href = "main.html";
    })
    .catch(function(err){
      createAlertDialog('login-error-dialog');
//      alert('メールアドレス or shareMe ID およびパスワードが違います');
    });
  })
};


 /***
  ユーザ登録処理
 **/
const user_regist = () => {
  const page = $('#loginNavigator')[0].topPage;
  const userName = page.querySelector('#register_id').value;
  if( userName=='' ) {
    createAlertDialog('regist-error1');
//    alert('メールアドレスを入力してください。');
  }else if( !mail_check(userName) ) {
    createAlertDialog('regist-error2');
//    alert('正しいメールアドレスを入力してください。');
  } else {
    ncmb.User.requestSignUpEmail(userName)
      .then(function(data){
      // 送信後処理
      createAlertDialog('regist-notice1');
//      alert('登録メールを送信しました。');
      loginNavigator.popPage();
    })
      .catch(function(err){
      // エラー処理
      createAlertDialog('regist-error3');
//      alert('入力されたメールアドレスは既に登録されています。');
    });

  }
};


 /***
  パスワード再発行処理
 **/
const forgot_password = () => {
  const page = $('#loginNavigator')[0].topPage;
  const userName = page.querySelector('#forgot_password_id').value;
  if( userName=='' ) {
    createAlertDialog('forgot-error1');
//    alert('メールアドレスを入力してください。');
  }else if( !mail_check(userName) ) {
    createAlertDialog('forgot-error2');
//    alert('正しいメールアドレスを入力してください。');
  } else {
    var user = new ncmb.User();
    user.set("mailAddress", userName);
    user.requestPasswordReset()
      .then(function(data){
        // 送信後処理
        createAlertDialog('forgot-notice1');
//        alert('パスワード再発行メールを送信しました。');
        loginNavigator.popPage();
      })
        .catch(function(err){
        // エラー処理
        createAlertDialog('forgot-error3');
//        alert('入力されたメールアドレスは存在しませんでした。\n再度お試しください。');
      });
  }
};


 /***
  ログアウト処理
 **/
const logout = () => {
  // 確認ダイアログを出します
  ons.notification.confirm({
    message: 'ログアウトしますか？'
  })
  .then((id) => {
    // id == 1 はOKボタンを押した場合です
    if (id != 1) {
      throw 1;
    }
    // ログアウト処理
    return ncmb.User.logout();
  })
  .then(() => {
    // 処理完了したら登録/ログイン画面に遷移します
    current_user = null;
    for (let key in myPhotos) {
        delete myPhotos[key];
    }
    // for (let key in timelinePhotos) {
    //     delete timelinePhotos[key];
    // }
    location.href = "index.html";
  })
  .catch((err) => {
    // 確認ダイアログでCancelを選んだ場合
    console.log(err);
  })
};


 /***
  登録メール処理
 **/
const regist_mail = (id, password, to) => {
  let data = {
    id: id,
    password: password,
    to: to
  };
  $.ajax({
    type: 'POST',
    url: 'http://takahito-shima.sakura.ne.jp/regist_mail.php',
    data:JSON.stringify(data),
    contentType: 'application/json',
    dataType: "json",
    success: function (json_data) {
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('システムエラー。時間を置いてアクセスしてください。');
    },
    complete: function() {
    }
  });
};


 /***
  パスワード再発行メール処理
 **/
const forgot_password_mail = (id, password, to) => {
  let data = {
    id: id,
    password: password,
    to: to
  };
  $.ajax({
    type: 'POST',
    url: 'http://takahito-shima.sakura.ne.jp/reset_password_mail.php',
    data:JSON.stringify(data),
    contentType: 'application/json',
    dataType: "json",
    success: function (json_data) {
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert('システムエラー。時間を置いてアクセスしてください。');
    },
    complete: function() {
    }
  });
};


 /***
  メールアドレスチェック関数
 **/
function mail_check( mail ) {
  var mail_regex1 = new RegExp( '(?:[-!#-\'*+/-9=?A-Z^-~]+\.?(?:\.[-!#-\'*+/-9=?A-Z^-~]+)*|"(?:[!#-\[\]-~]|\\\\[\x09 -~])*")@[-!#-\'*+/-9=?A-Z^-~]+(?:\.[-!#-\'*+/-9=?A-Z^-~]+)*' );
  var mail_regex2 = new RegExp( '^[^\@]+\@[^\@]+$' );
  if( mail.match( mail_regex1 ) && mail.match( mail_regex2 ) ) {
    // 全角チェック
    if( mail.match( /[^a-zA-Z0-9\!\"\#\$\%\&\'\(\)\=\~\|\-\^\\\@\[\;\:\]\,\.\/\\\<\>\?\_\`\{\+\*\} ]/ ) ) { return false; }
    // 末尾TLDチェック（〜.co,jpなどの末尾ミスチェック用）
    if( !mail.match( /\.[a-z]+$/ ) ) { return false; }
    return true;
  } else {
    return false;
  }
}

//  ncmb.User.requestSignUpEmail("")
//    .then(function(data){
    // 送信後処理
//  })
//    .catch(function(err){
    // エラー処理
//  });
// #register_id
//  // ユーザを作成します
//  const user = new ncmb.User();
//  user
//    .set("userName", userName)
//    .set("password", password)
//    // 登録処理を実行します
//    .signUpByAccount()
//    .then(() => {
//      // 成功したらログイン処理を行います
//      return ncmb.User.login(userName, password)
//    })
//    .catch((err) => {
//      // 失敗したらログイン処理を行います
//      return ncmb.User.login(userName, password)
//    })
//    .then((user) => {
//      current_user = user;
//      // 写真の取得
//      getMyPhotos();
//      // ログイン成功したらメイン画面に遷移します
//      $('#nav')[0].pushPage('main.html', {animation: 'fade'});
//    })
//    .catch((err) => {
//      // 失敗したらアラートを出します
//      ons.notification.alert('Login failed.')
//    });


