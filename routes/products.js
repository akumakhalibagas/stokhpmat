var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET product page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokhp",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("product/list", {
          title: "stokhp",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var stokhp = {
        id: req.params.id,
      };
      var delete_sql = "DELETE from stokhp where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          stokhp,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/products");
            } else {
              req.flash("msg_info", "Delete Product Success");
              res.redirect("/products");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query("SELECT * FROM stokhp where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errors_detail = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/products");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Product tidak ditemukan!");
              res.redirect("/products");
            } else {
              console.log(rows);
              res.render("product/edit", {
                title: "Edit",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("Nama_Barang", "Harap isi Nama_Barang!").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_Nama_Barang= req.sanitize("Nama_Barang").escape().trim();
      v_warna = req.sanitize("warna").escape().trim();
      v_Harga_Barang = req.sanitize("Harga_Barang").escape().trim();
      v_Stok_Hp = req.sanitize("Stok_Hp").escape();

      if (!req.files) {
        var stokhp = {
          Nama_Barang: v_Nama_Barang,
          warna: v_warna,
          Harga_Barang: v_Harga_Barang,
          Stok_Hp: v_Stok_Hp,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpg";
        file.mv("public/images/upload/" + file.name);

        var stokhp = {
          Nama_Barang: v_Nama_Barang,
          warna: v_warna,
          Harga_Barang: v_Harga_Barang,
          Stok_Hp: v_Stok_Hp,
          gambar: file.name,
      }
      };

      var update_sql = "update stokhp SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          stokhp,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("product/edit", {
                Nama_Barang: req.param("Nama_Barang"),
                warna: req.param("warna"),
                Harga_Barang: req.param("Harga_Barang"),
                Stok_Hp: req.param("Stok_Hp"),
              });
            } else {
              req.flash("msg_info", "Update product success");
              res.redirect("/products/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/products/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("Nama_Barang", "Please fill the merk").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_Nama_Barang = req.sanitize("Nama_Barang").escape().trim();
    v_warna = req.sanitize("warna").escape().trim();
    v_Harga_Barang = req.sanitize("Harga_Barang").escape().trim();
    v_Stok_Hp = req.sanitize("Stok_Hp").escape();

    var file = req.files.gambar;
    file.mimetype == "image/jpg";
    file.mv("public/images/upload/" + file.name);

    var stokhp = {
      Nama_Barang: v_Nama_Barang,
      warna: v_warna,
      Harga_Barang: v_Harga_Barang,
      Stok_Hp: v_Stok_Hp,
      gambar: file.name,
    };
    
    var insert_sql = "INSERT INTO stokhp SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        stokhp,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("product/add-product", {
              v_Nama_Barang: req.param("Nama_Barang"),
              v_warna: req.param("warna"),
              v_Harga_Barang: req.param("Harga_Barang"),
              v_Stok_Hp: req.param("Stok_Hp"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create product success");
            res.redirect("/products");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("product/add-product", {
      Nama_Barang: req.param("Nama_Barang"),
      warna: req.param("warna"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("product/add-product", {
    title: "Add New Product",
    Nama_Barang: "",
    warna: "",
    Harga_Barang: "",
    Stok_Hp: "",
    session_store: req.session,
  });
});

module.exports = router;
