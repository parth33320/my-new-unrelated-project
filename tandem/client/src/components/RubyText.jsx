import '../styles/RubyText.css';

export default function RubyText({ chars = [], readings = [], show = false }) {
  // TODO: Render chunks with <ruby>/<rt> when show is true.
  return <span>{chars.join('')}</span>;
}
