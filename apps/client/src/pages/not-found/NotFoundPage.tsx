import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-gray-600">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="mb-8 text-gray-500">요청하신 페이지가 존재하지 않습니다.</p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
      >
        메인 페이지로 이동
      </Link>
    </div>
  );
}

export default NotFoundPage;
