export default function getSenderFull(loggedUser, users) {
  if (!loggedUser || !users || users.length < 2) return "Unknown";
  return users[0]._id === loggedUser._id ? users[1] : users[0];
}
