// add admin cloud function
const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const adminEmail = document.querySelector('#admin-email').value;
  const addWorkspacesRole = functions.httpsCallable('addWorkspacesRole');

  // var elems = document.querySelectorAll('select');
  var listSpan = document.querySelectorAll('.li-workspace span');
  let workspaces = '{';
  listSpan.forEach((e, i) => {
    workspaces += `"${e.textContent}" : "${document.getElementById(e.textContent).value}"`;
    if ((listSpan.length - 1) >= (i + 1)) workspaces += ',';
  })
  workspaces += '}';

  addWorkspacesRole({ email: adminEmail, obj: JSON.parse(workspaces) }).then(result => {
    console.log(result);
  });
});

// listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    user.getIdTokenResult().then(idTokenResult => {
      user.admin = idTokenResult.claims.admin;

      var listSpan = document.querySelectorAll('.li-workspace span');
      listSpan.forEach((e) => {
        user[e.textContent] = idTokenResult.claims[e.textContent];
      })
      setupUI(user);
    });
    db.collection('guides').onSnapshot(snapshot => {
      setupGuides(snapshot.docs);
    }, err => console.log(err.message));
  } else {
    setupUI();
    setupGuides([]);
  }
});

// create new guide
const createForm = document.querySelector('#create-form');
const error = document.querySelector('#msg-error');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  db.collection('workspaces').doc('asl').set({
    title: createForm.title.value,
    content: createForm.content.value
  }).then(() => {
    error.innerHTML = '';
    // close the create modal & reset form
    const modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createForm.reset();
  }).catch(err => {
    error.innerHTML = err.message;
    setTimeout(() => {
      error.innerHTML = '';
    }, 3000);
    console.log(err.message);
  });
});

// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user & add firestore data
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    return db.collection('users').doc(cred.user.uid).set({
      bio: signupForm['signup-bio'].value
    });
  }).then(() => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
    signupForm.querySelector('.error').innerHTML = ''
  }).catch(err => {
    signupForm.querySelector('.error').innerHTML = err.message;
  });
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
    loginForm.querySelector('.error').innerHTML = '';
  }).catch(err => {
    loginForm.querySelector('.error').innerHTML = err.message;
  });

});

const call = () => {
  db.collection('workspaces').onSnapshot(snapshot => {
    getWorkspaces(snapshot.docs);
  }, err => console.log(err.message))
}

call();
