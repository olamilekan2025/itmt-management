"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  Bell,
  Check,
  CheckCheck,
  Globe2,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  getAdminNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AdminNotification,
} from "@/lib/admin-notifications";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const { data: session } = useSession();

  /* =========================================================
     STATE
  ========================================================= */

  const [notifications, setNotifications] = useState<
    AdminNotification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [logoutModalOpen, setLogoutModalOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  // Separate refs are important because mobile and desktop
  // account menus are rendered as separate DOM elements.
  const mobileProfileMenuRef =
    useRef<HTMLDivElement | null>(null);

  const desktopProfileMenuRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================================
     SESSION
  ========================================================= */

  const accessToken =
    session?.accessToken as string | undefined;

  /* =========================================================
     ADMIN INFORMATION
  ========================================================= */

  const adminName =
    session?.user?.name?.trim() || "Administrator";

  const adminEmail =
    session?.user?.email?.trim() || "";

  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AD";

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  const loadNotifications = useCallback(
    async (showLoader = false) => {
      if (!accessToken) return;

      try {
        if (showLoader) {
          setLoadingNotifications(true);
        }

        const response = await getAdminNotifications(
          accessToken,
          {
            page: 1,
            limit: 5,
          }
        );

        setNotifications(
          response.notifications || []
        );

        setUnreadCount(
          response.unreadCount || 0
        );
      } catch (error) {
        console.error(
          "Failed to load admin notifications:",
          error
        );
      } finally {
        if (showLoader) {
          setLoadingNotifications(false);
        }
      }
    },
    [accessToken]
  );

  /* =========================================================
     INITIAL NOTIFICATION LOAD
  ========================================================= */

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  /* =========================================================
     MARK SINGLE NOTIFICATION AS READ
  ========================================================= */

  const handleMarkAsRead = async (
    notification: AdminNotification
  ) => {
    if (!accessToken || notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(
        accessToken,
        notification._id
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  /* =========================================================
     MARK ALL NOTIFICATIONS AS READ
  ========================================================= */

  const handleMarkAllAsRead = async () => {
    if (!accessToken || unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead(
        accessToken
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      toast.error(
        "Unable to mark notifications as read"
      );
    }
  };

  /* =========================================================
     MENU CONTROLS
  ========================================================= */

  const toggleNotifications = () => {
    setNotificationOpen((current) => !current);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((current) => !current);
    setNotificationOpen(false);
  };

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target = event.target as Node;

      const clickedInsideMobileMenu =
        mobileProfileMenuRef.current?.contains(
          target
        );

      const clickedInsideDesktopMenu =
        desktopProfileMenuRef.current?.contains(
          target
        );

      if (
        !clickedInsideMobileMenu &&
        !clickedInsideDesktopMenu
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, []);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setNotificationOpen(false);
      setProfileMenuOpen(false);
      setLogoutModalOpen(false);
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const openLogoutModal = () => {
    setProfileMenuOpen(false);
    setNotificationOpen(false);
    setLogoutModalOpen(true);
  };

  const cancelLogout = () => {
    if (loggingOut) return;

    setLogoutModalOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      toast.error(
        "Unable to sign out. Please try again."
      );

      setLoggingOut(false);
    }
  };

  /* =========================================================
     FORMAT NOTIFICATION DATE
  ========================================================= */

  const formatNotificationDate = (
    dateValue?: string
  ) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-40
          h-[68px]
          border-b
          border-slate-200/80
          bg-white/90
          backdrop-blur-xl
          sm:h-[72px]
          dark:border-slate-800
          dark:bg-slate-950/90
        "
      >
        <div
          className="
            flex
            h-full
            items-center
            justify-between
            px-3
            sm:px-5
            lg:px-7
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2.5
            "
          >
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open admin navigation"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-600
                transition-all
                duration-200
                hover:bg-slate-100
                hover:text-brand-navy
                active:scale-95
                lg:hidden
                dark:text-slate-300
                dark:hover:bg-slate-800
                dark:hover:text-white
              "
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* MOBILE PORTAL TITLE */}

            <div className="min-w-0 lg:hidden">
              <p
                className="
                  truncate
                  text-[13px]
                  font-bold
                  tracking-tight
                  text-brand-navy
                  dark:text-white
                "
              >
                Admin Portal
              </p>

              <div
                className="
                  mt-0.5
                  flex
                  items-center
                  gap-1.5
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500
                    shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Online
                </span>
              </div>
            </div>

            {/* DESKTOP PORTAL BRAND */}

            <div
              className="
                hidden
                items-center
                gap-3
                lg:flex
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-brand-navy
                  shadow-sm
                "
              >
                <ShieldCheck
                  className="
                    h-5
                    w-5
                    text-brand-gold
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    tracking-tight
                    text-brand-navy
                    dark:text-white
                  "
                >
                  Administration Portal
                </p>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-500
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    System Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-0.5
              sm:gap-1.5
            "
          >
            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <div className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Open notifications"
                aria-expanded={notificationOpen}
                className={`
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-200
                  active:scale-95
                  ${
                    notificationOpen
                      ? `
                        bg-brand-light
                        text-brand-navy
                        dark:bg-brand-navy/40
                        dark:text-brand-gold
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-100
                        hover:text-brand-navy
                        dark:text-slate-400
                        dark:hover:bg-slate-800
                        dark:hover:text-white
                      `
                  }
                `}
              >
                <Bell className="h-[19px] w-[19px]" />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      right-0.5
                      top-0.5
                      flex
                      min-h-[17px]
                      min-w-[17px]
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-brand-gold
                      px-1
                      text-[8px]
                      font-black
                      leading-none
                      text-brand-navy
                      dark:border-slate-950
                    "
                  >
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION BACKDROP */}

              {notificationOpen && (
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() =>
                    setNotificationOpen(false)
                  }
                  className="
                    fixed
                    inset-0
                    z-40
                    cursor-default
                    bg-slate-950/20
                    backdrop-blur-[2px]
                    lg:bg-transparent
                    lg:backdrop-blur-0
                  "
                />
              )}

              {/* NOTIFICATION DROPDOWN */}

              {notificationOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+12px)]
                    z-50
                    w-[min(390px,calc(100vw-1.5rem))]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_24px_70px_rgba(15,23,42,0.18)]
                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:shadow-black/40
                  "
                >
                  {/* NOTIFICATION HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-slate-100
                      px-4
                      py-3.5
                      dark:border-slate-800
                    "
                  >
                    <div>
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <h3
                          className="
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                          "
                        >
                          Notifications
                        </h3>

                        {unreadCount > 0 && (
                          <span
                            className="
                              rounded-full
                              bg-brand-gold/15
                              px-2
                              py-0.5
                              text-[9px]
                              font-bold
                              text-brand-navy
                              dark:text-brand-gold
                            "
                          >
                            {unreadCount} unread
                          </span>
                        )}
                      </div>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-slate-400
                        "
                      >
                        Stay updated with your system
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        loadNotifications(true)
                      }
                      disabled={loadingNotifications}
                      aria-label="Refresh notifications"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-brand-navy
                        disabled:cursor-not-allowed
                        dark:hover:bg-slate-800
                        dark:hover:text-white
                      "
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          loadingNotifications
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* MARK ALL */}

                  {unreadCount > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        px-4
                        py-2
                        dark:border-slate-800
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        {unreadCount} unread
                        notification
                        {unreadCount !== 1 ? "s" : ""}
                      </span>

                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-[10px]
                          font-bold
                          text-brand-navy
                          transition
                          hover:text-brand-gold
                          dark:text-brand-gold
                        "
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    </div>
                  )}

                  {/* NOTIFICATION BODY */}

                  <div
                    className="
                      max-h-[390px]
                      overflow-y-auto
                    "
                  >
                    {loadingNotifications ? (
                      <div className="space-y-3 p-4">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="flex gap-3"
                          >
                            <div
                              className="
                                h-9
                                w-9
                                shrink-0
                                animate-pulse
                                rounded-xl
                                bg-slate-100
                                dark:bg-slate-800
                              "
                            />

                            <div
                              className="
                                flex-1
                                space-y-2
                              "
                            >
                              <div
                                className="
                                  h-3
                                  w-3/4
                                  animate-pulse
                                  rounded
                                  bg-slate-100
                                  dark:bg-slate-800
                                "
                              />

                              <div
                                className="
                                  h-2.5
                                  w-1/2
                                  animate-pulse
                                  rounded
                                  bg-slate-100
                                  dark:bg-slate-800
                                "
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div
                        className="
                          px-5
                          py-10
                          text-center
                        "
                      >
                        <div
                          className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                            dark:bg-slate-800
                          "
                        >
                          <Bell className="h-5 w-5" />
                        </div>

                        <p
                          className="
                            mt-3
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          No notifications
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          You&apos;re all caught up.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`
                            group
                            border-b
                            border-slate-100
                            px-4
                            py-3.5
                            transition
                            last:border-b-0
                            dark:border-slate-800
                            ${
                              notification.isRead
                                ? "bg-white dark:bg-slate-900"
                                : "bg-brand-light/30 dark:bg-brand-navy/10"
                            }
                          `}
                        >
                          <div className="flex gap-3">
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-brand-navy
                                text-brand-gold
                              "
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-2
                                "
                              >
                                <p
                                  className={`
                                    text-xs
                                    leading-5
                                    ${
                                      notification.isRead
                                        ? "font-medium text-slate-700 dark:text-slate-300"
                                        : "font-bold text-slate-900 dark:text-white"
                                    }
                                  `}
                                >
                                  {notification.title}
                                </p>

                                {!notification.isRead && (
                                  <span
                                    className="
                                      mt-1
                                      h-2
                                      w-2
                                      shrink-0
                                      rounded-full
                                      bg-brand-gold
                                    "
                                  />
                                )}
                              </div>

                              {notification.message && (
                                <p
                                  className="
                                    mt-1
                                    line-clamp-2
                                    text-[11px]
                                    leading-5
                                    text-slate-500
                                    dark:text-slate-400
                                  "
                                >
                                  {notification.message}
                                </p>
                              )}

                              <div
                                className="
                                  mt-2
                                  flex
                                  items-center
                                  justify-between
                                  gap-2
                                "
                              >
                                <span
                                  className="
                                    text-[9px]
                                    font-medium
                                    text-slate-400
                                  "
                                >
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </span>

                                {!notification.isRead && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMarkAsRead(
                                        notification
                                      )
                                    }
                                    className="
                                      flex
                                      items-center
                                      gap-1
                                      text-[9px]
                                      font-bold
                                      text-brand-navy
                                      opacity-0
                                      transition
                                      group-hover:opacity-100
                                      hover:text-brand-gold
                                      dark:text-brand-gold
                                    "
                                  >
                                    <Check className="h-3 w-3" />
                                    Read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* NOTIFICATION FOOTER */}

                  <div
                    className="
                      border-t
                      border-slate-100
                      p-2
                      dark:border-slate-800
                    "
                  >
                    <Link
                      href="/dashboards/admin/notifications"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        rounded-xl
                        px-3
                        py-2.5
                        text-[11px]
                        font-bold
                        text-brand-navy
                        transition
                        hover:bg-brand-light
                        dark:text-brand-gold
                        dark:hover:bg-slate-800
                      "
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                MOBILE ACCOUNT
            ================================================= */}

            <div
              ref={mobileProfileMenuRef}
              className="
                relative
                lg:hidden
              "
            >
              <button
                type="button"
                onClick={toggleProfileMenu}
                aria-label="Open administrator account menu"
                aria-expanded={profileMenuOpen}
                className="
                  group
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-200
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-gold/60
                  focus-visible:ring-offset-2
                  dark:focus-visible:ring-offset-slate-950
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-brand-gold/80
                    bg-brand-navy
                    text-[11px]
                    font-black
                    tracking-wide
                    text-white
                    shadow-sm
                    transition
                    group-hover:border-brand-gold
                  "
                >
                  {initials}
                </span>

                <span
                  className="
                    absolute
                    bottom-0.5
                    right-0.5
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-white
                    bg-emerald-500
                    dark:border-slate-950
                  "
                />
              </button>

              {/* MOBILE ACCOUNT MENU */}

              {profileMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+12px)]
                    z-50
                    w-[250px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_24px_70px_rgba(15,23,42,0.18)]
                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:shadow-black/40
                  "
                >
                  <AccountMenuContent
                    adminName={adminName}
                    adminEmail={adminEmail}
                    initials={initials}
                    openLogoutModal={openLogoutModal}
                    compact
                  />
                </div>
              )}
            </div>

            {/* =================================================
                DESKTOP ACCOUNT
            ================================================= */}

            <div
              ref={desktopProfileMenuRef}
              className="
                relative
                hidden
                lg:block
              "
            >
              <button
                type="button"
                onClick={toggleProfileMenu}
                aria-label="Open administrator account menu"
                aria-expanded={profileMenuOpen}
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-2
                  py-1.5
                  transition-all
                  duration-200
                  hover:bg-slate-50
                  active:scale-[0.98]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-gold/60
                  dark:hover:bg-slate-800/70
                "
              >
                {/* ADMIN DETAILS */}

                <div className="text-right">
                  <p
                    className="
                      max-w-[180px]
                      truncate
                      text-xs
                      font-bold
                      tracking-tight
                      text-slate-800
                      dark:text-white
                    "
                  >
                    {adminName}
                  </p>

                  <div
                    className="
                      mt-0.5
                      flex
                      items-center
                      justify-end
                      gap-1.5
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-emerald-500
                      "
                    />

                    <span
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      Administrator
                    </span>
                  </div>
                </div>

                {/* DESKTOP AVATAR */}

                <div className="relative">
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-brand-gold/80
                      bg-brand-navy
                      text-[11px]
                      font-black
                      tracking-wide
                      text-white
                      shadow-sm
                      transition-all
                      duration-200
                      group-hover:border-brand-gold
                      group-hover:shadow-[0_4px_18px_rgba(200,169,81,0.20)]
                    "
                  >
                    {initials}
                  </span>

                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      h-3
                      w-3
                      rounded-full
                      border-2
                      border-white
                      bg-emerald-500
                      shadow-sm
                      dark:border-slate-950
                    "
                  />
                </div>
              </button>

              {/* DESKTOP ACCOUNT DROPDOWN */}

              {profileMenuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+12px)]
                    z-50
                    w-[280px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_24px_70px_rgba(15,23,42,0.18)]
                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:shadow-black/40
                  "
                >
                  <AccountMenuContent
                    adminName={adminName}
                    adminEmail={adminEmail}
                    initials={initials}
                    openLogoutModal={openLogoutModal}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {logoutModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/70
            px-4
            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div
            className="
              w-full
              max-w-[420px]
              overflow-hidden
              rounded-3xl
              border
              border-brand-gold/20
              bg-brand-navy
              shadow-[0_30px_100px_rgba(15,23,42,0.45)]
            "
          >
            {/* MODAL CONTENT */}

            <div
              className="
                relative
                px-6
                pb-6
                pt-7
              "
            >
              {/* CLOSE */}

              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                aria-label="Close logout dialog"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-white/50
                  transition
                  hover:bg-white/10
                  hover:text-white
                  disabled:cursor-not-allowed
                "
              >
                <X className="h-4 w-4" />
              </button>

              {/* ICON */}

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-brand-gold/30
                  bg-brand-gold/10
                  text-brand-gold
                "
              >
                <LogOut className="h-6 w-6" />
              </div>

              {/* TITLE */}

              <h2
                id="logout-title"
                className="
                  mt-5
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Sign out of Admin Portal?
              </h2>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-white/60
                "
              >
                You will be signed out of your
                administrator account and returned
                to the login page.
              </p>

              {/* ACCOUNT INDICATOR */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-brand-gold/60
                    bg-brand-gold/10
                    text-[10px]
                    font-black
                    text-brand-gold
                  "
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    {adminName}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-white/40
                    "
                  >
                    {adminEmail ||
                      "Administrator account"}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS */}

            <div
              className="
                flex
                gap-3
                border-t
                border-white/10
                bg-black/10
                px-6
                py-4
              "
            >
              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-white/15
                  bg-white/5
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white/80
                  transition
                  hover:bg-white/10
                  hover:text-white
                  disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-brand-gold
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-brand-navy
                  shadow-[0_8px_24px_rgba(200,169,81,0.18)]
                  transition
                  hover:brightness-105
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loggingOut ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   ACCOUNT MENU COMPONENT
========================================================= */

interface AccountMenuContentProps {
  adminName: string;
  adminEmail: string;
  initials: string;
  openLogoutModal: () => void;
  compact?: boolean;
}

function AccountMenuContent({
  adminName,
  adminEmail,
  initials,
  openLogoutModal,
  compact = false,
}: AccountMenuContentProps) {
  return (
    <>
      {/* =====================================================
          ACCOUNT HEADER
      ===================================================== */}

      <div
        className="
          border-b
          border-slate-100
          bg-slate-50/80
          px-4
          py-4
          dark:border-slate-800
          dark:bg-slate-950/50
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              relative
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              border-2
              border-brand-gold
              bg-brand-navy
              text-xs
              font-black
              text-white
            "
          >
            {initials}

            <span
              className="
                absolute
                bottom-0
                right-0
                h-3
                w-3
                rounded-full
                border-2
                border-white
                bg-emerald-500
                dark:border-slate-950
              "
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {adminName}
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-[10px]
                text-slate-400
              "
            >
              {adminEmail ||
                "Administrator account"}
            </p>

            <div
              className="
                mt-1.5
                flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                "
              />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACCOUNT OPTIONS
      ===================================================== */}

      <div className="p-2">
        {/* BACK TO WEBSITE */}

        <Link
          href="/"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-brand-light
            hover:text-brand-navy
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-brand-gold
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-brand-light
              text-brand-navy
              dark:bg-brand-navy/40
              dark:text-brand-gold
            "
          >
            <Globe2 className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">
              Back to Website
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Return to the public ITMT website
            </p>
          </div>
        </Link>

        {/* PROFILE */}

        <Link
          href="/dashboards/admin/profile"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-100
            hover:text-brand-navy
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-500
              dark:bg-slate-800
              dark:text-slate-400
            "
          >
            <UserRound className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">
              Profile
            </p>

            {!compact && (
              <p className="mt-0.5 text-[9px] text-slate-400">
                View administrator profile
              </p>
            )}
          </div>
        </Link>

        {/* SETTINGS */}

        <Link
          href="/dashboards/admin/settings"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-100
            hover:text-brand-navy
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-500
              dark:bg-slate-800
              dark:text-slate-400
            "
          >
            <Settings className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">
              Settings
            </p>

            {!compact && (
              <p className="mt-0.5 text-[9px] text-slate-400">
                Manage portal preferences
              </p>
            )}
          </div>
        </Link>

        {/* DIVIDER */}

        <div
          className="
            my-2
            h-px
            bg-slate-100
            dark:bg-slate-800
          "
        />

        {/* SIGN OUT */}

        <button
          type="button"
          onClick={openLogoutModal}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-sm
            font-semibold
            text-red-600
            transition
            hover:bg-red-50
            dark:text-red-400
            dark:hover:bg-red-950/30
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-red-50
              text-red-500
              dark:bg-red-950/30
              dark:text-red-400
            "
          >
            <LogOut className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-semibold">
              Sign out
            </p>

            {!compact && (
              <p className="mt-0.5 text-[9px] text-red-400">
                End administrator session
              </p>
            )}
          </div>
        </button>
      </div>
    </>
  );
}

