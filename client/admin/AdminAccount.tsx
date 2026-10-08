// Your own sign-in details. The design has no account page; this follows its admin-users card
// for "you" (admin/users.html), with the edit and change-password dialogs.
import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileDialog from './account/ProfileDialog';
import PasswordDialog from './account/PasswordDialog';
import { initials } from './ui/format';
import { Icon } from './ui/icons';
import { usePageMeta } from '../hooks/usePageMeta';

type Dialog = 'profile' | 'password' | null;

export default function AdminAccount() {
  usePageMeta('Account · Admin');
  const { user } = useAuth();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = useCallback(() => setDialog(null), []);
  const name = user?.name || user?.email || '';

  return (
    <>
      <div className="ph">
        <div>
          <h1>Account</h1>
          <p>Your sign-in details for this panel. Client details are visible here, so keep your password to yourself.</p>
        </div>
        <div className="actions">
          <button className="abtn ghost" type="button" onClick={() => setDialog('profile')}><Icon name="edit" />Edit profile</button>
          <button className="abtn ghost" type="button" onClick={() => setDialog('password')}><Icon name="key" />Change password</button>
        </div>
      </div>

      <div className="users">
        <article className="card user">
          <span className="avatar lg">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(name)}</span>
          <div className="txt">
            <strong>{name}</strong>
            <small>{user?.email}</small>
            <div className="badges"><span className="tag">Admin</span><span className="tag">You</span></div>
          </div>
        </article>
      </div>

      <ProfileDialog open={dialog === 'profile'} onClose={close} />
      <PasswordDialog open={dialog === 'password'} onClose={close} />
    </>
  );
}
