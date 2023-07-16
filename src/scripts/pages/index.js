import './index.css';

import {
  profileEditBtn, formEditProfile, config, formAddNewCard,
  popupAddNewCardOpenBtn, nameInput, jobInput,
  buttonEditAvatar, formEditAvatar, avatar
} from '../utils/constants.js';
import Section from "../components/Section.js";
import FormValidator from '../components/FormValidator.js';
import Card from "../components/Card.js";
import PopupWithForm from "../components/PopupWithForm.js";
import UserInfo from "../components/UserInfo.js";
import PopupWithImage from "../components/PopupWithImage.js";
import Api from "../components/Api.js";
import PopupWithConfirmation from "../components/PopupWithConfirmation.js";


/* ---------- API ----------- */
const api = new Api({
  baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-70',
  headers: {
    authorization: '64deca92-8acf-4085-a982-7ce0631137e5',
    'Content-Type': 'application/json'
  }
});

let userId;

Promise.all([api.getInitialCards(), api.getUserInfo()])
  .then(([initialCards, userData]) => {
    userInfo.setUserInfo(userData);
    userId = userData._id;
    cardsList.renderItems(initialCards);
  })
  .catch((err) => {
    console.log(`Ошибка: ${err}`);
  });

const userInfo = new UserInfo({
  username: '.profile__title',
  job: '.profile__description',
  avatar: '.profile__avatar'
});

const editProfilePopup = new PopupWithForm({
  popupSelector: '.popup_type_edit',
  handleFormSubmit: (dataForm) => {
    editProfilePopup.loading(true);
    api.editUserInfo(dataForm)
      .then((dataForm) => {
        userInfo.setUserInfo(dataForm);
        editProfilePopup.close();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        editProfilePopup.loading(false);
      });
  }
});
editProfilePopup.setEventListeners();

function fillInEditProfileFormInputs({ username, job }) {
  nameInput.value = username;
  jobInput.value = job;
}

const editAvatarPopup = new PopupWithForm({
  popupSelector: '.popup_type_avatar',
  handleFormSubmit: (data) => {
    editAvatarPopup.loading(true);
    api.editAvatar(data)
      .then((data) => {
        avatar.src = data.avatar;
        editAvatarPopup.close();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        editAvatarPopup.loading(false);
      });
  }
});
editAvatarPopup.setEventListeners();

buttonEditAvatar.addEventListener('click', () => {
  formEditAvatarValidator.toggleButtonState();
  editAvatarPopup.open();
});

profileEditBtn.addEventListener('click', () => {
  const info = userInfo.getUserInfo();
  fillInEditProfileFormInputs({
    username: info.username,
    job: info.job
  });
  editProfilePopup.open();
});


const createCard = (data) => {
  const card = new Card({
    data: data,
    cardSelector: '.element-template',
    userId: userId,
    handleCardClick: (name, link) => {
      viewImagePopup.open(name, link);
    },
    handleDeleteIconClick: (cardId) => {
      deleteCardPopup.open();
      deleteCardPopup.submitCallback(() => {
        api.deleteCard(cardId)
          .then(() => {
            deleteCardPopup.close();
            card.deleteCard();
          })
          .catch((err) => {
            console.log(`Ошибка: ${err}`);
          });
      });
    },
    handleSetLike: (cardId) => {
      api.setLike(cardId)
        .then((data) => {
          card.handleLikeCard(data);
        })
        .catch((err) => {
          console.log(`Ошибка: ${err}`);
        });
    },
    handleRemoveLike: (cardId) => {
      api.deleteLike(cardId)
        .then((data) => {
          card.handleLikeCard(data);
        })
        .catch((err) => {
          console.log(`Ошибка: ${err}`);
        });
    }
  });
  const cardElement = card.generateCard();
  return cardElement;
};

const cardsList = new Section({
  renderer: (card) => {
    cardsList.addItem(createCard(card));
  },
}, '.elements');

const deleteCardPopup = new PopupWithConfirmation({
  popupSelector: '.popup_type_delete-card'
});
deleteCardPopup.setEventListeners();


const addCardPopup = new PopupWithForm({
  popupSelector: '.popup_type_new-card',
  handleFormSubmit: (formData) => {
    addCardPopup.loading(true);
    api.addCard(formData)
      .then((formData) => {
        cardsList.addItem(createCard(formData));
        addCardPopup.close();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        addCardPopup.loading(false);
      });
  }
});

addCardPopup.setEventListeners();

popupAddNewCardOpenBtn.addEventListener('click', () => {
  formAddNewCardValidator.toggleButtonState();
  addCardPopup.open();
})


const viewImagePopup = new PopupWithImage('.popup_type_image');
viewImagePopup.setEventListeners();

const formEditProfileValidator = new FormValidator(config, formEditProfile);
formEditProfileValidator.enableValidation();

const formAddNewCardValidator = new FormValidator(config, formAddNewCard);
formAddNewCardValidator.enableValidation();

const formEditAvatarValidator = new FormValidator(config, formEditAvatar);
formEditAvatarValidator.enableValidation();



